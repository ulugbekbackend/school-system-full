from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin',      'Admin / Direktor'),
        ('teacher',    "O'qituvchi"),
        ('student',    'Talaba'),
        ('parent',     'Ota-ona'),
        ('hr',         'HR xodim'),
        ('accountant', 'Buxgalter'),
    ]
    role       = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone      = models.CharField(max_length=20, blank=True)
    avatar     = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.role})"
