# EduCore — To'liq Arxitektura

> Xususiy maktab boshqaruv platformasi. Bu hujjat **qurilgan tizimni** (as-built)
> tasvirlaydi — barcha tuzatishlar bilan. Topilgan xatolar va ularning yechimi
> uchun [architecture-review.md](architecture-review.md) ga qarang.

**Stack:** React 19 (JSX, Vite) · Django 5.2 + DRF · PostgreSQL · JWT auth

---

## 1. Umumiy ko'rinish

EduCore — 6 rolli, ko'p modulli SPA + REST API tizimi:

```
┌─────────────────────────────────────────────────────────────┐
│                      Brauzer (React SPA)                      │
│  Login → role bo'yicha redirect → rolga xos panel + sidebar   │
└───────────────────────────────┬─────────────────────────────┘
                                 │ axios (Bearer JWT)
                                 │ /api/...  (dev: Vite proxy)
┌───────────────────────────────▼─────────────────────────────┐
│                    Django REST Framework                      │
│  JWT auth · rol asosida permission · 13 ta app · DRF generics │
└───────────────────────────────┬─────────────────────────────┘
                                 │ ORM
┌───────────────────────────────▼─────────────────────────────┐
│                        PostgreSQL                             │
└──────────────────────────────────────────────────────────────┘
         │                                  │
   Gmail SMTP (email)               Eskiz.uz (SMS)
```

### Rollar (6 ta)
| Rol | Panel | Asosiy imkoniyatlar |
|-----|-------|---------------------|
| `admin` | Direktor | To'liq nazorat: user/talaba/xodim CRUD, moliya, hisobot |
| `teacher` | O'qituvchi | Davomat, baho, topshiriq, material |
| `student` | Talaba | Darslar, baholar, jadval, topshiriqlar |
| `parent` | Ota-ona | Farzand davomati, baholari, to'lovlari |
| `hr` | HR | Xodimlar, maosh, ta'til, inventar |
| `accountant` | Buxgalter | HR bilan bir xil panel (moliya yo'naltirilgan) |

---

## 2. Papka tuzilmasi

```
school-system-full/
├── .gitignore                      # .env, venv, node_modules, media...
├── docs/
│   ├── main-rules.md               # Loyiha qoidalari
│   ├── architecture-review.md      # Xato tahlili + tuzatishlar
│   └── architecture.md             # ← shu hujjat
├── backend/
│   ├── .env / .env.example         # Sirlar (.env gitignore'da)
│   ├── requirements.txt
│   ├── manage.py
│   ├── core/                       # settings, urls, wsgi, asgi
│   └── <13 app>/                   # har biri: models, serializers, views, urls, admin
└── frontend/
    ├── package.json / vite.config.js / index.html
    ├── .env / .env.example
    └── src/
        ├── main.jsx · App.jsx · index.css
        ├── api/        # axios.js + 11 domen moduli
        ├── store/      # authStore, uiStore (zustand)
        ├── routes/     # index.jsx, ProtectedRoute.jsx
        ├── components/ # layout/, shared/
        ├── pages/      # auth, admin, teacher, student, parent, hr
        └── utils/      # constants, helpers
```

---

## 3. Backend applar (13 ta)

| App | Modellar | Vazifa |
|-----|----------|--------|
| **users** | `User` (custom, role bilan) | Auth, JWT, rol, permissions |
| **students** | `Class`, `Student`, `ParentStudent` | Talabalar, sinflar, ota-ona bog'lanishi |
| **staff** | `Department`, `Subject`, `Teacher`, `StaffMember` | Xodimlar, fanlar, bo'limlar |
| **academics** | `TimeSlot`, `Room`, `Schedule` | Dars jadvali, xonalar |
| **attendance** | `AttendanceRecord` | Davomat (bulk kiritish) |
| **grades** | `GradeCategory`, `Grade`, `TermReport` | Baholar, chorak yakunlari |
| **lms** | `Course`, `Lesson`, `LessonFile`, `Assignment`, `Submission`, `Quiz`, `Question`, `Choice` | O'quv platformasi |
| **finance** | `FeeType`, `Invoice`, `Payment` | To'lovlar, hisob-fakturalar |
| **hr** | `LeaveType`, `LeaveRequest`, `Payroll`, `Inventory` | Maosh, ta'til, inventar |
| **crm** | `Lead`, `LeadActivity` | Qabul jarayoni (funnel) |
| **notifications** | `Notification`, `SMSLog` + `services.py` | Email/SMS xizmatlari |
| **analytics** | (modelsiz) | Dashboard agregatsiya API'lari |

---

## 4. Ma'lumotlar modeli (ERD)

```
User (role) ──1:1── Student ──N:1── Class ──N:1── User(teacher, homeroom)
   │                  │  │
   │                  │  └──N:M── ParentStudent ──N:1── User(parent)
   │                  │
   │                  ├──1:N── AttendanceRecord ──N:1── Subject, Teacher
   │                  ├──1:N── Grade ──────────── N:1── Subject, Teacher, GradeCategory
   │                  ├──1:N── Invoice ──N:1── FeeType
   │                  │           └──1:N── Payment   (save → Invoice.status='paid')
   │                  └──1:N── Submission ──N:1── Assignment
   │
   ├──1:1── Teacher ──N:M── Subject, Class ; ──N:1── Department
   │           └──1:N── Course ──1:N── Lesson, Assignment, Quiz
   │                                            Quiz ──1:N── Question ──1:N── Choice
   ├──1:1── StaffMember ──N:1── Department
   ├──1:N── LeaveRequest ──N:1── LeaveType
   ├──1:N── Payroll        (save → net = base + bonus − deduction)
   └──1:N── Notification

Schedule: Class × Subject × Teacher × Room × TimeSlot × day_of_week (unique: teacher+slot+day+year)
```

### Muhim biznes-qoidalar (modelda)
- **`Payment.save()`** — to'lovlar yig'indisi invoice summasiga yetganda `Invoice.status='paid'` (qisman to'lovni ham hisoblaydi).
- **`Payroll.save()`** — `net_salary = base_salary + bonus − deduction` avtomatik.
- **`User`** custom (`AUTH_USER_MODEL='users.User'`), `role` maydoni bilan; profillar (`Student`/`Teacher`/`StaffMember`) `OneToOne`.

---

## 5. Autentifikatsiya va avtorizatsiya

### JWT oqimi
```
POST /api/auth/login/ {username, password}
   → { access (2 soat), refresh (30 kun), role, full_name, user_id }
access tugaganda → POST /api/auth/token/refresh/ {refresh} → yangi access
```
Tokenga `role` va `full_name` claim sifatida qo'shiladi (`CustomTokenObtainPairSerializer`).

### Permission klasslari (`users/permissions.py`)
| Klass | Ruxsat |
|-------|--------|
| `IsAdmin` | faqat admin |
| `IsAdminOrReadOnly` | o'qish — authenticated, yozish — admin |
| `IsTeacher` / `IsTeacherOrAdmin` | o'qituvchi (+admin) |
| `IsStaff` | admin / hr / accountant |
| `IsOwnerOrAdmin` | obyekt egasi yoki admin (object-level) |

> **Xavfsizlik:** global default `IsAuthenticated`, lekin har bir view o'ziga mos
> permission qo'yadi. Masalan, user yaratish — faqat `IsAdmin` (privilege
> escalation oldini olish). Analytics view'lari rolga bog'langan (talaba
> `admin-summary`'ga → **403**).

---

## 6. API endpointlari (asosiy)

Barcha yo'llar `/api/` prefiksi bilan.

### auth
```
POST   /auth/login/              JWT olish
POST   /auth/token/refresh/      access yangilash
GET    /auth/me/                 joriy user
GET    /auth/users/              [admin] ro'yxat   POST: user yaratish
GET/PUT/DELETE /auth/users/<id>/ [admin]
```

### students
```
GET    /students/                ro'yxat (filter: status, class, gender; search)
POST   /students/create/         [admin] User+Student birga (atomic)
GET/PUT/DELETE /students/<id>/
GET/POST /students/classes/      sinflar
```

### staff
```
/staff/teachers/  · /staff/teachers/create/  [admin]
/staff/members/   · /staff/members/create/   [admin]
/staff/subjects/  · /staff/departments/
```

### academics · attendance · grades
```
/academics/schedule/ · /academics/rooms/ · /academics/timeslots/
/attendance/                 ro'yxat + create (teacher request.user'dan)
/attendance/bulk/            [teacher] butun sinf davomati update_or_create
/attendance/summary/<sid>/   talaba xulosasi
/grades/ · /grades/categories/ · /grades/term-reports/
```

### lms · finance · hr · crm
```
/lms/courses/ · /lessons/ · /assignments/ · /submissions/ · /quizzes/ · /questions/
/finance/fee-types/ · /invoices/ · /payments/        [IsStaff]
/hr/leave-types/ · /leaves/ · /payroll/ · /inventory/  [IsStaff]
/crm/leads/ · /crm/activities/                        [IsStaff]
```

### notifications · analytics
```
GET  /notifications/              o'z xabarnomalari
POST /notifications/<id>/read/ · /notifications/read-all/
GET  /analytics/admin-summary/    [admin]
GET  /analytics/teacher-summary/  [teacher]
GET  /analytics/student-summary/  [student]
GET  /analytics/parent-summary/?child_id=  [parent] — ko'p farzand qo'llab-quvvatlanadi
GET  /analytics/hr-summary/       [staff]
```

---

## 7. Frontend arxitekturasi

### Holat boshqaruvi
- **`authStore`** (zustand + persist) — `user`, `role`; `setAuth` tokenlarni
  localStorage'ga **ham** yozadi (bitta manba), `clearAuth` tozalaydi.
- **TanStack Query** — server holati (dashboard ma'lumotlari), `staleTime` 5 daqiqa.
- **`uiStore`** — sidebar holati.

### API qatlami (`src/api/`)
- `axios.js` — `baseURL = VITE_API_URL || '/api'` (nisbiy → dev'da Vite proxy,
  prod'da Nginx). 401'da refresh-interceptor avtomatik token yangilaydi va
  so'rovni qayta yuboradi; refresh ham **shu instance** orqali (prod'da buzilmaydi).
- 11 domen moduli (`auth.js`, `students.js`, …) — endpointlar `/api` prefiksisiz.

### Routing (`src/routes/index.jsx`)
- `createBrowserRouter` — har route `ProtectedRoute allowedRoles={[...]}` bilan o'ralgan.
- `user` yo'q → `/login`; rol mos kelmasa → `/login`.
- Login'dan keyin `ROLE_REDIRECT[role]` ga yo'naltiriladi.
- To'liq qurilmagan sahifalar `Placeholder` ko'rsatadi (backend API tayyor).

### Komponentlar
```
layout/  Sidebar (rolga xos menyu) · PageWrapper (sidebar + sarlavha + content)
shared/  StatCard (statistika kartasi) · Placeholder (vaqtinchalik sahifa)
```
Stillar — inline (Tailwind ishlatilmaydi, ortiqcha bog'liqlik olib tashlangan).

### Sahifalar — barchasi to'liq, real API bilan
```
auth/    Login
admin/   Dashboard · Students (CRUD) · Staff · Academics (Sinf/Fan/Bo'lim/Xona/Vaqt/Baho turi/Kurs/Jadval)
         · Finance (faktura+to'lov+FeeType) · CRM (leadlar) · Reports · Settings (userlar)
teacher/ Dashboard · MyClasses · Attendance (bulk kiritish) · Grades · Assignments · Materials
student/ Dashboard · MyCourses · Grades · Schedule (haftalik) · Assignments
parent/  Dashboard · MyChildren · Attendance · Grades · Payments   (farzand tanlash bilan)
hr/      Dashboard · StaffList · Leaves (tasdiq/rad + Ta'til turlari) · Payroll · Inventory
```

### Qayta ishlatiladigan komponentlar
```
ui/      Button · Field (input/select/textarea) · Modal
shared/  StatCard · Badge · DataTable · ChildSelector · Tabs · CrudResource
layout/  Sidebar · PageWrapper (header + NotificationBell)
```
List sahifalar `DataTable` + filtr + `Modal` forma shablonidan foydalanadi;
ma'lumotnoma (reference) sahifalari universal `CrudResource` orqali quriladi.

---

## 8. Tashqi integratsiyalar

| Xizmat | Maqsad | Konfiguratsiya |
|--------|--------|----------------|
| **Gmail SMTP** | Email xabarlar | `.env`: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` (App Password!), `DEFAULT_FROM_EMAIL` |
| **Eskiz.uz** | SMS (davomat ogohlantirishi) | `.env`: `ESKIZ_TOKEN`, `ESKIZ_FROM` |

`notifications/services.py`:
- `send_email()` — Gmail SMTP (**faol**)
- `send_sms()` — Eskiz.uz (funksiya tayyor, har bir urinish `SMSLog`'ga yoziladi)
- `notify(user, subject, message)` — email yuboradi; SMS qatori **comment'da**
- `notify_attendance(student, status)` — talaba kelmaganda ota-onaga xabar

> **Hozircha:** Eskiz tokeni yo'q (shartnoma kerak), shuning uchun xabarlar faqat
> **email** orqali boradi. SMS kodi to'liq tayyor — token olingach `services.py`
> ichidagi SMS qatorlarini comment'dan chiqarish (uncomment) kifoya.
> Token sozlanmagan bo'lsa `send_sms` crash qilmaydi — xato qaytaradi va logga yozadi.

---

## 9. Sozlamalar va xavfsizlik (`core/settings.py`)

- `python-decouple` — barcha sirlar `.env`'dan (`SECRET_KEY`, DB, email, SMS, CORS).
- `DEBUG=False` default; `.env`'da `True` (lokal).
- `AUTH_PASSWORD_VALIDATORS` yoqilgan.
- `CORS_ALLOWED_ORIGINS` `.env`'dan (hardcode emas), `CORS_ALLOW_CREDENTIALS=True`.
- JWT: access **2 soat**, refresh 30 kun.
- `TIME_ZONE='Asia/Tashkent'`, `USE_TZ=True`, `LANGUAGE_CODE='uz'`.
- MEDIA faqat `DEBUG`'da Django orqali (prod'da Nginx).

---

## 10. Ishga tushirish

### Backend
```bash
cd backend
python -m venv venv && venv\Scripts\activate        # Windows
pip install -r requirements.txt
copy .env.example .env                                # va qiymatlarni to'ldiring
# PostgreSQL'da bazani yarating: createdb school_educore_db
python manage.py migrate
python manage.py seed_demo            # ixtiyoriy: demo ma'lumot
python manage.py runserver            # http://localhost:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev                            # http://localhost:5173
```

### Demo loginlar (`seed_demo` dan keyin)
```
admin / admin123          teacher1 / demo1234
student1 / demo1234       parent1 / demo1234
```

---

## 11. Kelajak ishlari (rejada, hali qilinmagan)

- Eskiz SMS'ni yoqish (token olgach `services.py` SMS qatorlarini uncomment).
- CRM funnel UI (backend tayyor).
- Tahrirlash/o'chirish (edit/delete) modallar — hozircha asosan yaratish va ko'rish.
- Quiz topshirish va avtomatik baholash oqimi.
- To'lov shlyuzlari (Click/Payme/Uzum) bilan real integratsiya.
- Real-time xabarnomalar (WebSocket/SSE).
- Hisobotlarni eksport (Excel/PDF).
- Produksiya: Gunicorn + Nginx + statik build, `DEBUG=False`, SES/SendGrid.
```

