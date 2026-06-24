"""Xabar yuborish xizmatlari: Email (Gmail SMTP) — faol, SMS (Eskiz.uz) — vaqtincha o'chirilgan.

Eskiz tokeni hali yo'q (shartnoma kerak). Shuning uchun hozircha xabarlar faqat
EMAIL orqali boradi. SMS kodi tayyor turibdi — token olgandan keyin
notify() ichidagi SMS qatorlarini comment'dan chiqaring (uncomment).
"""
import requests
from django.conf import settings
from django.core.mail import send_mail

from .models import SMSLog


def send_sms(phone: str, message: str) -> dict:
    """Eskiz.uz orqali SMS yuborish va logga yozish.

    Funksiyaning o'zi tayyor — token sozlangach ishlaydi.
    """
    if not settings.ESKIZ_TOKEN:
        SMSLog.objects.create(phone=phone, message=message, status='failed',
                              response='ESKIZ_TOKEN sozlanmagan')
        return {'error': 'ESKIZ_TOKEN sozlanmagan'}
    try:
        response = requests.post(
            'https://notify.eskiz.uz/api/message/sms/send',
            headers={'Authorization': f'Bearer {settings.ESKIZ_TOKEN}'},
            data={'mobile_phone': phone, 'message': message, 'from': settings.ESKIZ_FROM},
            timeout=10,
        )
        data = response.json()
        SMSLog.objects.create(phone=phone, message=message,
                              status='sent' if response.ok else 'failed',
                              response=str(data))
        return data
    except Exception as e:
        SMSLog.objects.create(phone=phone, message=message, status='failed', response=str(e))
        return {'error': str(e)}


def send_email(to_email: str, subject: str, message: str) -> bool:
    """Gmail SMTP orqali email yuborish."""
    if not to_email:
        return False
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [to_email],
                  fail_silently=False)
        return True
    except Exception:
        return False


def notify(user, subject: str, message: str):
    """Foydalanuvchiga xabar yuborish — email orqali (faol) va SMS orqali (vaqtincha o'chirilgan).

    Eskiz tokeni bo'lgach pastdagi SMS qatorini comment'dan chiqaring.
    """
    # ── Email (faol) ──
    if getattr(user, 'email', ''):
        send_email(user.email, subject, message)

    # ── SMS (hozircha o'chirilgan — Eskiz token olgach yoqing) ──
    # if getattr(user, 'phone', ''):
    #     send_sms(user.phone, message)


def notify_attendance(student, status):
    """Davomat o'zgarganda ota-onalarga xabar (hozircha email orqali)."""
    from students.models import ParentStudent

    msg = {
        'absent': f"{student.user.get_full_name()} bugun darsga kelmadi.",
        'late':   f"{student.user.get_full_name()} darsga kech keldi.",
    }.get(status)
    if not msg:
        return

    subject = 'EduCore — Davomat xabari'
    for ps in ParentStudent.objects.filter(student=student).select_related('parent'):
        parent = ps.parent
        # ── Email (faol) ──
        if parent.email:
            send_email(parent.email, subject, msg)
        # ── SMS (hozircha o'chirilgan — Eskiz token olgach yoqing) ──
        # if parent.phone:
        #     send_sms(parent.phone, msg)
