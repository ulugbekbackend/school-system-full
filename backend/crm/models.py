from django.db import models

from users.models import User


class Lead(models.Model):
    STATUS_CHOICES = [
        ('new',       'Yangi'),
        ('contacted', "Bog'lanildi"),
        ('trial',     'Sinov darsi'),
        ('enrolled',  'Qabul qilindi'),
        ('rejected',  'Rad etildi'),
    ]
    SOURCE_CHOICES = [
        ('instagram', 'Instagram'), ('telegram', 'Telegram'),
        ('referral', 'Tavsiya'), ('website', 'Sayt'),
        ('call', "Qo'ng'iroq"), ('other', 'Boshqa'),
    ]
    child_name   = models.CharField(max_length=200)
    child_age    = models.IntegerField()
    parent_name  = models.CharField(max_length=200)
    parent_phone = models.CharField(max_length=20)
    parent_email = models.EmailField(blank=True)
    source       = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='other')
    status       = models.CharField(max_length=15, choices=STATUS_CHOICES, default='new')
    target_class = models.CharField(max_length=10, blank=True)
    trial_date   = models.DateField(null=True, blank=True)
    assigned_to  = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                     related_name='assigned_leads')
    notes        = models.TextField(blank=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'leads'

    def __str__(self):
        return f"{self.child_name} ({self.status})"


class LeadActivity(models.Model):
    lead       = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='activities')
    user       = models.ForeignKey(User, on_delete=models.CASCADE)
    action     = models.CharField(max_length=200)
    note       = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lead_activities'
        ordering = ['-created_at']
