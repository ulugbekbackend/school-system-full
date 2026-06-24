from django.db import models

from users.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ('attendance', 'Davomat'), ('grade', 'Baho'), ('payment', "To'lov"),
        ('assignment', 'Topshiriq'), ('general', 'Umumiy'), ('alert', 'Ogohlantirish'),
    ]
    recipient  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    type       = models.CharField(max_length=20, choices=TYPE_CHOICES, default='general')
    title      = models.CharField(max_length=200)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    link       = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']


class SMSLog(models.Model):
    phone    = models.CharField(max_length=20)
    message  = models.TextField()
    status   = models.CharField(max_length=20)   # sent / failed
    provider = models.CharField(max_length=20, default='eskiz')
    response = models.TextField(blank=True)
    sent_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'sms_logs'
