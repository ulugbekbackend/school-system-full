from django.db import models

from students.models import Class
from users.models import User


class Department(models.Model):
    name = models.CharField(max_length=100)
    head = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                             related_name='headed_departments')

    class Meta:
        db_table = 'departments'

    def __str__(self):
        return self.name


class Subject(models.Model):
    name     = models.CharField(max_length=100)
    code     = models.CharField(max_length=10, unique=True)
    category = models.CharField(max_length=50, blank=True)

    class Meta:
        db_table = 'subjects'

    def __str__(self):
        return f"{self.name} ({self.code})"


class Teacher(models.Model):
    user          = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    teacher_id    = models.CharField(max_length=20, unique=True)
    department    = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    subjects      = models.ManyToManyField(Subject, related_name='teachers', blank=True)
    classes       = models.ManyToManyField(Class, related_name='teachers', blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    hire_date     = models.DateField()
    salary        = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active     = models.BooleanField(default=True)

    class Meta:
        db_table = 'teachers'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.teacher_id})"


class StaffMember(models.Model):
    POSITION_CHOICES = [
        ('hr',         'HR Menejer'),
        ('accountant', 'Buxgalter'),
        ('librarian',  'Kutubxonachi'),
        ('security',   'Qorovul'),
        ('cleaner',    'Tozalovchi'),
        ('other',      'Boshqa'),
    ]
    user       = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    staff_id   = models.CharField(max_length=20, unique=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position   = models.CharField(max_length=50, choices=POSITION_CHOICES)
    hire_date  = models.DateField()
    salary     = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    is_active  = models.BooleanField(default=True)

    class Meta:
        db_table = 'staff_members'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.position})"
