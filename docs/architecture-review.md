# EduCore — Arxitektura Review va Tuzatishlar

> Bu hujjat `school-platform-bosqichlar.md` rejasini ko'rib chiqib, topilgan xato va
> kamchiliklarni hamda ularning to'g'rilangan variantini ko'rsatadi.
> **Qoidaga ko'ra:** kodlash boshlanishidan oldin shu tuzatishlar hisobga olinishi kerak.

Muammolar 3 darajaga bo'lingan:

- 🔴 **CRITICAL** — loyiha umuman ishga tushmaydi yoki xavfsizlik teshigi.
- 🟡 **IMPORTANT** — biznes-logika xato ishlaydi yoki noto'g'ri natija beradi.
- 🔵 **MINOR** — tozalash, izchillik, kelajakdagi muammolarning oldini olish.

---

## 🔴 CRITICAL

### C1. Ko'pchilik `urls.py` fayllari yo'q — loyiha ishga tushmaydi

`core/urls.py` 12 ta app uchun `include(...)` qiladi:

```python
path('api/staff/',      include('staff.urls')),
path('api/academics/',  include('academics.urls')),
path('api/grades/',     include('grades.urls')),
path('api/lms/',        include('lms.urls')),
path('api/finance/',    include('finance.urls')),
path('api/hr/',         include('hr.urls')),
path('api/crm/',        include('crm.urls')),
path('api/notifications/', include('notifications.urls')),
```

Lekin rejada faqat `users`, `students`, `analytics` uchun `urls.py` ko'rsatilgan.
Qolganlari uchun `urls.py`, `serializers.py`, `views.py` **yo'q**. Django ishga tushganda
darhol `ModuleNotFoundError: No module named 'staff.urls'` beradi.

**Tuzatish:** Har bir app uchun kamida bo'sh `urls.py` bo'lishi shart:

```python
# masalan backend/staff/urls.py
from django.urls import path

urlpatterns = []
```

Eng to'g'risi — har bosqichda app yaratilganda **darhol** uning `serializers.py`,
`views.py`, `urls.py` to'liq yoziladi va shundan keyingina `core/urls.py` ga `include`
qo'shiladi. Reja bo'ylab `core/urls.py` ni bosqichma-bosqich to'ldirib boring,
hammasini boshida emas.

---

### C2. Role asosida ruxsat (authorization) yo'q — jiddiy xavfsizlik teshigi

`settings.py` da:

```python
'DEFAULT_PERMISSION_CLASSES': (
    'rest_framework.permissions.IsAuthenticated',
),
```

Bu faqat "tizimga kirgan bo'lsa bas" degani. Natijada:

- Oddiy **talaba** `POST /api/auth/users/` orqali o'ziga `role='admin'` user yaratishi mumkin.
- Har qanday user **barcha** talabalar ro'yxatini, baholarini, moliyaviy ma'lumotlarni ko'radi.
- `UserListCreateView`, `StudentCreateView` hech qanday rol tekshiruvisiz ochiq.

Strukturada `users/permissions.py` bor, lekin mazmuni yozilmagan va hech qayerda ishlatilmagan.

**Tuzatish:** `users/permissions.py` ni yozing va views'larda qo'llang.

```python
# backend/users/permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated
                    and request.user.role == 'admin')

class IsAdminOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.role == 'admin')

class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.role == 'teacher')

class IsOwnerOrAdmin(BasePermission):
    """Foydalanuvchi faqat o'z resursini ko'radi, admin hammasini."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'admin':
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'recipient', None)
        return owner == request.user
```

Misol uchun user yaratishni faqat adminga ruxsat berish:

```python
# backend/users/views.py
from .permissions import IsAdmin

class UserListCreateView(generics.ListCreateAPIView):
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [IsAdmin]          # <-- qo'shildi
    ...
```

Shuningdek `StudentSummaryView`, `ParentSummaryView`, `TeacherSummaryView` lar
hozir har qanday authenticated userga ochiq — talaba `request.user.teacher_profile` ga
murojaat qilsa `RelatedObjectDoesNotExist` xatosi chiqadi (pastdagi C5 ga qarang).

---

### C3. `StudentCreateSerializer` javob (response) serializatsiyasida crash beradi

```python
class StudentCreateView(generics.CreateAPIView):
    serializer_class = StudentCreateSerializer
```

`StudentCreateSerializer` — bu oddiy `serializers.Serializer` bo'lib, `username`,
`email`, `password` kabi maydonlari bor. `create()` `Student` obyektini qaytaradi.
DRF `CreateAPIView` saqlagandan keyin `serializer.data` ni qaytaradi va `Student`
obyektidan `username` maydonini o'qimoqchi bo'ladi — lekin `username` `Student` da
emas, `Student.user` da. Natijada **`AttributeError`** yoki bo'sh/noto'g'ri javob.

**Tuzatish:** `create()` dan keyin to'g'ri serializer bilan javob qaytaring.

```python
# backend/students/views.py
from rest_framework.response import Response
from rest_framework import status

class StudentCreateView(generics.CreateAPIView):
    serializer_class = StudentCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        out = StudentSerializer(student, context={'request': request})
        return Response(out.data, status=status.HTTP_201_CREATED)
```

Qo'shimcha: `username`/`student_id` unikalligini serializer darajasida tekshiring,
aks holda `IntegrityError` 500 xatosi sifatida chiqadi. `User.objects.create_user`
va `Student.objects.create` ni bitta tranzaksiyaga o'rang:

```python
from django.db import transaction

def create(self, validated_data):
    from users.models import User
    with transaction.atomic():
        user = User.objects.create_user(...)
        student = Student.objects.create(user=user, ...)
    return student
```

(Aks holda `Student` yaratishda xato bo'lsa, `User` yetim qolib ketadi.)

---

### C4. `.gitignore` yo'q — `.env` va sirlar git'ga tushib ketishi mumkin

Reja `.env` faylini (SECRET_KEY, DB parol bilan) o'z ichiga oladi, lekin `.gitignore`
hech qayerda yo'q. Bu loyiha qoidasiga (`.env va secret keylar qo'shilmaganligini
tekshirish`) to'g'ridan-to'g'ri zid.

**Tuzatish:** Loyiha ildizida `.gitignore` yarating:

```gitignore
# Python / Django
backend/venv/
__pycache__/
*.pyc
backend/.env
backend/media/
backend/staticfiles/
db.sqlite3

# Node / Vite
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# IDE / OS
.vscode/
.idea/
.DS_Store
```

Va repoga `backend/.env.example` (parolsiz namuna) qo'shing, haqiqiy `.env` esa hech
qachon commit qilinmasin.

---

### C5. `request.user.teacher_profile` / `student_profile` xavfsiz emas

`TeacherSummaryView`, `StudentSummaryView`, `attendance/BulkAttendanceView` to'g'ridan-to'g'ri
`request.user.teacher_profile` ga murojaat qiladi. Agar user teacher emas (yoki teacher
profili hali yaratilmagan) bo'lsa — `User.teacher_profile.RelatedObjectDoesNotExist`
500 xatosi.

**Tuzatish:** Avval rolni permission bilan cheklang, keyin profil borligini tekshiring:

```python
class TeacherSummaryView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        teacher = getattr(request.user, 'teacher_profile', None)
        if teacher is None:
            return Response({'detail': "O'qituvchi profili topilmadi"}, status=400)
        ...
```

---

## 🟡 IMPORTANT

### I1. Email (Gmail SMTP) sozlamasi yo'q

Siz email xabarlar uchun Gmail SMTP ishlatmoqchisiz, lekin `settings.py` da hech qanday
`EMAIL_*` sozlama yo'q. `notifications` app ham faqat SMS (`Eskiz`) bilan ishlaydi.

**Tuzatish:** `settings.py` ga qo'shing:

```python
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = config('EMAIL_HOST_USER')        # to'liq gmail manzil
EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD') # Gmail "App Password" (oddiy parol emas!)
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default=EMAIL_HOST_USER)
```

`.env` ga:

```ini
EMAIL_HOST_USER=youraddress@gmail.com
EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
DEFAULT_FROM_EMAIL=EduCore <youraddress@gmail.com>
```

> ⚠️ Gmail oddiy parolni qabul qilmaydi. 2FA yoqib, **App Password** yarating.
> Ko'p email yuborilsa Gmail kunlik limitga uradi (~500/kun) — keyinchalik SendGrid/
> Amazon SES ga o'tishni reja qiling.

`notifications/services.py` ga email funksiyasi:

```python
from django.core.mail import send_mail
from django.conf import settings

def send_email(to_email: str, subject: str, message: str) -> bool:
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL,
                  [to_email], fail_silently=False)
        return True
    except Exception:
        return False
```

`ESKIZ_TOKEN` ham `settings.py` da `config('ESKIZ_TOKEN', default='')` orqali
o'qilishi kerak — hozir `services.py` `settings.ESKIZ_TOKEN` ga murojaat qiladi, lekin
u settings'da umuman e'lon qilinmagan → `AttributeError`.

---

### I2. To'lov qilinganda `Invoice.status` avtomatik yangilanmaydi

`Payment` yaratilganda bog'liq `Invoice` `status` `pending` bo'lib qoladi. Natijada
"Qarzdorlar" hisobi (`overdue_count`, `debt`) doim noto'g'ri bo'ladi — to'langan ham
qarzdor ko'rinadi.

**Tuzatish:** `Payment` saqlanganda invoice holatini yangilang (signal yoki `save`):

```python
# backend/finance/models.py
from django.db.models import Sum

class Payment(models.Model):
    ...
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        paid_total = self.invoice.payments.aggregate(s=Sum('amount'))['s'] or 0
        if paid_total >= self.invoice.amount:
            self.invoice.status = 'paid'
            self.invoice.save(update_fields=['status'])
```

Bu "qisman to'lov" holatini ham to'g'ri hisoblaydi.

---

### I3. Oylik daromad grafigidagi oy hisobi noto'g'ri

```python
for i in range(5, -1, -1):
    d = today.replace(day=1) - timedelta(days=i*30)
```

`timedelta(days=30)` har doim ham bir oy emas. Masalan fevral (28 kun) tufayli oylar
takrorlanishi yoki o'tkazib yuborilishi mumkin → grafikda bir oy ikki marta yoki
umuman yo'q.

**Tuzatish:** Aniq oy arifmetikasidan foydalaning:

```python
from dateutil.relativedelta import relativedelta   # pip install python-dateutil

monthly_payments = []
first = today.replace(day=1)
for i in range(5, -1, -1):
    d = first - relativedelta(months=i)
    amt = Payment.objects.filter(
        paid_at__year=d.year, paid_at__month=d.month
    ).aggregate(total=Sum('amount'))['total'] or 0
    monthly_payments.append({'month': d.strftime('%b'), 'amount': float(amt)})
```

`python-dateutil` ni `requirements.txt` ga qo'shing.

---

### I4. `requirements.txt` da yetishmayotgan paketlar

`notifications/services.py` `import requests` ishlatadi, lekin `requests` `pip install`
ro'yxatida yo'q. `relativedelta` uchun `python-dateutil` ham kerak.

**Tuzatish:**

```bash
pip install requests python-dateutil
# produksiya uchun:
pip install gunicorn
pip freeze > requirements.txt
```

---

### I5. Token refresh produksiyada buziladi

`axios.js` da:

```js
const { data } = await axios.post('/api/auth/token/refresh/', { refresh })
```

Bu yerda `api` emas, balki global `axios` ishlatilgan. Uning `baseURL` yo'q, shuning
uchun nisbiy `/api/...` ga so'rov yuboradi — bu faqat Vite dev-proxy tufayli ishlaydi.
Produksiyada (statik build, proxy yo'q) bu so'rov noto'g'ri domenga ketadi.

Bundan tashqari `baseURL` `http://localhost:8000` hardcode qilingan asosiy
`api` instance bilan proxy konfiguratsiyasi bir-biriga zid (biri to'g'ridan, biri proxy
orqali). Bittasini tanlang.

**Tuzatish (tavsiya — hammasi `/api` nisbiy, proxy/Nginx hal qiladi):**

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',   // nisbiy
  headers: { 'Content-Type': 'application/json' },
})
```

Va endpoint'lardan `/api` prefiksini olib tashlang (`api.post('/auth/login/', ...)`),
yoki `baseURL` ni `''` qoldirib endpoint'larda `/api/...` saqlang — lekin ikkalasini
aralashtirmang. Refresh chaqiruvini ham `api` instance bilan qiling:

```js
const { data } = await api.post('/auth/token/refresh/', { refresh })
```

---

### I6. Token saqlash ikki joyda — sinxrondan chiqadi

Tokenlar `localStorage` ('access_token'/'refresh_token') da **va** zustand persist
('auth-storage') da alohida saqlanadi. `setAuth` `localStorage` ga yozmaydi — buni
`Login.jsx` qo'lda qiladi. Sahifa yangilanganda yoki boshqa tab'da bu ikki manba
mos kelmay qolishi mumkin.

**Tuzatish:** Bitta manbani tanlang. Eng sodda variant — barchasini zustand store
ichida boshqarish va interceptor store'dan o'qishi:

```js
// authStore.js
setAuth: (data) => {
  localStorage.setItem('access_token', data.access)
  localStorage.setItem('refresh_token', data.refresh)
  set({ user: {...}, token: data.access, role: data.role })
},
```

Shunda `Login.jsx` da qo'lda `localStorage.setItem` qilish shart emas.

---

### I7. `ParentSummaryView` faqat birinchi farzandni ko'rsatadi

```python
ps = ParentStudent.objects.filter(parent=request.user)...first()
```

Bir nechta farzandi bor ota-ona uchun faqat bittasi ko'rinadi. `MyChildren` sahifasi
(strukturada bor) bilan ziddiyat.

**Tuzatish:** Frontend `?child_id=` query param yuborsin, view shu bo'yicha tanlasin;
param bo'lmasa birinchisini default qilib, lekin javobda farzandlar ro'yxatini ham
qaytaring (tanlash uchun).

---

## 🔵 MINOR

### M1. Talaba dashboard sarlavhasida xato belgi

```jsx
<PageWrapper title="Mening paneliم">
```

`paneliم` — oxirida tasodifiy arab harfi `م` bor. `"Mening panelim"` bo'lishi kerak.

### M2. Tailwind o'rnatilgan, lekin ishlatilmagan

`tailwindcss`, `postcss`, `autoprefixer` o'rnatiladi va `npx tailwindcss init -p`
chaqiriladi, lekin barcha stillar **inline** yozilgan. `index.css` da `@tailwind`
direktivalari yo'q, `tailwind.config.js` `content` sozlanmagan. Ya'ni Tailwind umuman
ishlamaydi — keraksiz bog'liqlik.

**Qaror qabul qiling:** yo Tailwind'ni to'liq sozlab undan foydalaning, yo inline
stillarda qolib Tailwind paketlarini olib tashlang. Inline stillar tez o'sib ketadi —
loyiha hajmi uchun Tailwind yoki CSS Modules tavsiya etiladi.

### M3. `is_active` `User` modelida qayta e'lon qilingan

`AbstractUser` da allaqachon `is_active` bor. Qayta yozish shart emas (zarar yo'q,
lekin chalkash). `created_at`/`updated_at` qo'shilishi esa o'rinli.

### M4. `RoleRoute.jsx` strukturada bor, lekin ishlatilmaydi

Rol tekshiruvi `ProtectedRoute` ichida `allowedRoles` orqali qilingan. `RoleRoute.jsx`
ortiqcha — yo o'chiring, yo `ProtectedRoute` ni soddalashtirib mantiqni `RoleRoute` ga
ko'chiring.

### M5. `StudentSummaryView` da `total_lessons` = bugungi darslar soni

`'total_lessons': len(today_schedule)` — bu "jami darslar" emas, "bugungi darslar".
Dashboard'da "Darslar soni" deb belgilangan → chalkash. Nomini `today_lessons` qiling
yoki haqiqiy jami kurslar sonini hisoblang.

### M6. `Class` modeli `students` app ichida

Konseptual jihatdan `Class` (sinf) `academics` app'ga mos keladi va `academics`,
`staff`, `lms` undan import qiladi. Hozir `students.models.Class` — ishlaydi, lekin
domen bo'yicha noizchil. Kelajakdagi circular import xavfini kamaytirish uchun `Class`
ni `academics` ga ko'chirishni o'ylab ko'ring (yoki shu holatini ongli ravishda qabul
qiling).

### M7. JWT access token muddati 8 soat — uzoq

`ACCESS_TOKEN_LIFETIME = 8 soat` xavfsizlik nuqtai nazaridan uzoq. O'g'irlangan token
8 soat amal qiladi. Odatda 15–60 daqiqa + refresh token mexanizmi (sizda bor)
ishlatiladi. Maktab ilovasi uchun 1–2 soat maqbul murosa.

### M8. Teacher / StaffMember profillarini yaratish yo'li yo'q

`Teacher` va `StaffMember` modellari bor, lekin ularni yaratuvchi serializer/view
ko'rsatilmagan (Student uchun bor). 5-bosqichda `Student` dagidek `StaffCreateSerializer`
(User + profil birga, `transaction.atomic`) yozilishi kerak.

---

## Qo'shimcha tavsiyalar (reja uchun)

1. **Test ma'lumotlari (seed):** har bosqichni tekshirish uchun `python manage.py`
   uchun fixtures yoki `seed.py` skripti qo'shing — bo'sh bazada dashboardlar bo'sh
   ko'rinadi, xatoni topish qiyin.
2. **`createsuperuser`** custom User'da `role` so'ramaydi — superuser yaratilgandan
   keyin admin paneldan `role='admin'` qo'ying yoki `createsuperuser` ni
   override qiling.
3. **N+1 so'rovlar:** Analytics view'larda sinflar bo'yicha `for cls in classes:`
   ichida alohida `count()` chaqiruvlari bor — sinflar ko'paysa sekinlashadi.
   `annotate(Count(...))` bilan bitta so'rovga aylantiring.
4. **CORS:** produksiyada `CORS_ALLOWED_ORIGINS` ni `.env` dan o'qing, hardcode qilmang.
5. **`USE_TZ = True`** + `Asia/Tashkent`: `paid_at__month` UTC bo'yicha filtrlanadi —
   oy chegarasidagi to'lovlar boshqa oyga tushishi mumkin. Hisobotlarda buni hisobga oling.

---

## Tuzatishlar bo'yicha tartib (avval nima qilish kerak)

| Tartib | Element | Nega birinchi |
|--------|---------|---------------|
| 1 | C4 `.gitignore` + `.env.example` | Birinchi commit'gacha sir tushib ketmasin |
| 2 | C1 barcha `urls.py` | Loyiha ishga tushishi uchun |
| 3 | I1 + `ESKIZ_TOKEN` settings | Email/SMS konfiguratsiyasi to'liq bo'lsin |
| 4 | C2 + C5 permissions | Xavfsizlik teshigini boshidan yopish |
| 5 | C3, I2, I3 logika | Ma'lumot to'g'ri bo'lishi uchun |
| 6 | I5, I6 frontend auth | Produksiyada buzilmasligi uchun |
| 7 | MINOR | Tozalash, oxirida |

Reja umumiy jihatdan **mustahkam va to'liq** — modellar to'g'ri bog'langan, rollar
mantiqiy ajratilgan. Yuqoridagi tuzatishlardan keyin xavfsiz va ishonchli ishlaydi.
