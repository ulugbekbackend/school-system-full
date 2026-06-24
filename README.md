# EduCore — Maktab Boshqaruv Platformasi

Xususiy maktablar uchun ko'p modulli, 6 rolli boshqaruv platformasi: o'quvchilar, xodimlar, dars jadvali, davomat, baholar, LMS, moliya, HR va CRM — barchasi yagona tizimda. React 19 SPA + Django REST API.

---

## Imkoniyatlar

- **6 rol:** `admin` (direktor), `teacher`, `student`, `parent`, `hr`, `accountant` — har biri uchun alohida panel.
- **Akademik:** sinflar, fanlar, dars jadvali, davomat, baholash.
- **LMS:** kurslar, materiallar, topshiriqlar.
- **Moliya:** to'lovlar, hisob-fakturalar (`Payment.save()` → invoice avtomatik `paid`).
- **HR:** xodimlar, ish haqi (`Payroll`: net = base + bonus − deduction), ta'tillar, inventar.
- **CRM:** lidlar va murojaatlar.
- **Bildirishnomalar:** Email (Gmail SMTP — faol), SMS (Eskiz.uz — tayyor).
- **Analitika:** dashboard va hisobotlar.

## Texnologiyalar

| Qatlam | Stack |
|--------|-------|
| Frontend | React 19, Vite, React Router 6, TanStack Query, Zustand, Axios, Recharts |
| Backend | Django 5.2, Django REST Framework, SimpleJWT, django-filter |
| Ma'lumotlar bazasi | PostgreSQL |
| Auth | JWT (access 2 soat, refresh 30 kun; token'da `role` + `full_name`) |

## Tuzilma

```
school-system-full/
├── backend/    # Django REST API — 13 app:
│               #   users, students, staff, academics, attendance, grades,
│               #   lms, finance, hr, crm, notifications, analytics, core
└── frontend/   # React 19 + Vite SPA
    └── src/    # api, store (zustand), routes, components, pages
```

## Ishga tushirish

### Talablar
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+

### Backend

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt

# .env faylini tayyorlash:
cp .env.example .env        # va qiymatlarni to'ldiring

python manage.py migrate
python manage.py runserver   # http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env         # kerak bo'lsa VITE_API_URL ni o'zgartiring
npm run dev                  # http://localhost:5173
```

### Demo login

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admin` | `admin123` |
| Teacher | `teacher1` | `demo1234` |
| Student | `student1` | `demo1234` |
| Parent | `parent1` | `demo1234` |

> Demo ma'lumotlarni yuklash: `python manage.py seed_demo`

## Muhit o'zgaruvchilari

Barcha sirlar `.env` fayllarda saqlanadi (`backend/.env`, `frontend/.env`) — ular gitga commit qilinmaydi. Namuna sifatida `.env.example` fayllaridan foydalaning.

**Backend (`backend/.env`):** `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`, `DB_*`, `CORS_ALLOWED_ORIGINS`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`, `ESKIZ_TOKEN`.

**Frontend (`frontend/.env`):** `VITE_API_URL` (bo'sh qoldirilsa nisbiy `/api` ishlatiladi).

## Litsenziya

Tegishli litsenziya egasi tomonidan belgilanadi.
