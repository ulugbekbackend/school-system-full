# EduCore — Bajarilgan va Rejadagi ishlar (TODO)

> Belgilar: `[x]` — bajarilgan · `[ ]` — qilinishi kerak

---

## ✅ Bajarilgan

### Backend
- [x] Django + DRF + PostgreSQL asosi, 13 ta app
- [x] JWT auth (login, refresh, role + full_name token'da)
- [x] Rolga asoslangan ruxsatlar (admin / teacher / student / parent / hr / accountant)
- [x] Modellar: users, students, staff, academics, attendance, grades, lms, finance, hr, crm, notifications
- [x] Barcha CRUD/list API'lari + filtr, qidiruv, paginatsiya
- [x] Analytics API (5 ta dashboard summary)
- [x] To'lov → invoice statusini avtomatik yangilash
- [x] Davomat (bulk kiritish), rolga mos grades/attendance ko'rinishi
- [x] `/academics/my-schedule/` — haftalik jadval
- [x] Email (Gmail SMTP) — faol
- [x] Migratsiya + demo seed (`seed_demo`)

### Frontend
- [x] Login + rol bo'yicha redirect, himoyalangan route'lar
- [x] 5 ta dashboard (admin, teacher, student, parent, hr)
- [x] Barcha rol sahifalari (CRUD/list, real API bilan)
- [x] Akademik boshqaruv: Sinflar, Fanlar, Bo'limlar, Xonalar, Dars vaqtlari, Baho turlari, Kurslar, Dars jadvali
- [x] Moliya: hisob-fakturalar + to'lov + To'lov turlari (FeeType)
- [x] CRM (leadlar funnel + status o'zgartirish)
- [x] HR: Ta'til so'rovlari (tasdiq/rad) + Ta'til turlari
- [x] Xabarnomalar qo'ng'irog'i (bell, o'qilmagan soni, o'qildi)
- [x] UI kit: Button, Field, Modal, DataTable, Badge, ChildSelector, Tabs, CrudResource
- [x] axios refresh-interceptor, zustand auth store

### Xavfsizlik / sozlash
- [x] `.gitignore` + `.env.example` (sirlar himoyada)
- [x] CORS, parol validatorlari, JWT muddati

---

## ⏳ Qilinishi kerak

### Yuqori muhimlik
- [ ] **Eskiz SMS'ni yoqish** — token olgach `notifications/services.py` dagi SMS qatorlarini uncomment qilish
- [ ] **Edit / Delete** modallari — hozircha asosan yaratish va ko'rish bor
- [ ] Forma validatsiyasi va xato xabarlarini chiroyli ko'rsatish (hozircha JSON)

### O'rta muhimlik
- [ ] Teacher: o'ziga tegishli kurs/sinflarni filtrlash (hozircha hammasi ko'rinadi)
- [ ] Quiz (test) yaratish va topshirish + avtomatik baholash oqimi
- [ ] Submission (topshiriq javobi) baholash UI — o'qituvchi uchun
- [ ] Fayl yuklash (dars materiallari, topshiriq javoblari, avatar/photo)

### Past muhimlik / kelajak
- [ ] To'lov shlyuzlari (Click / Payme / Uzum) bilan real integratsiya
- [ ] Real-time xabarnomalar (WebSocket/SSE)
- [ ] Hisobotlarni eksport (Excel / PDF)
- [ ] N+1 so'rovlarni optimallashtirish (analytics)
- [ ] Mobil moslashuv (responsive sidebar)

### Produksiyaga chiqarish
- [ ] `DEBUG=False`, haqiqiy `SECRET_KEY`, `ALLOWED_HOSTS`
- [ ] Gunicorn + Nginx + statik build
- [ ] Email uchun SendGrid/SES (Gmail limiti ~500/kun)
- [ ] Backup va monitoring
