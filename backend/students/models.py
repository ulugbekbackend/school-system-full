from django.db import models

from users.models import User


class Class(models.Model):
    name             = models.CharField(max_length=20)    # "10-A", "9-B"
    grade_level      = models.IntegerField()              # 10, 9, ...
    academic_year    = models.CharField(max_length=9)     # "2024-2025"
    homeroom_teacher = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        limit_choices_to={'role': 'teacher'}, related_name='homeroom_class')
    capacity         = models.IntegerField(default=30)
    created_at       = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'classes'
        unique_together = ['name', 'academic_year']
        verbose_name_plural = 'classes'

    def __str__(self):
        return f"{self.name} ({self.academic_year})"


class Student(models.Model):
    STATUS_CHOICES = [
        ('active',    'Faol'),
        ('inactive',  'Nofaol'),
        ('graduated', 'Bitirgan'),
        ('expelled',  'Chiqarib yuborilgan'),
    ]
    GENDER_CHOICES = [('male', 'Erkak'), ('female', 'Ayol')]

    user            = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id      = models.CharField(max_length=20, unique=True)   # S-2024-001
    current_class   = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    date_of_birth   = models.DateField()
    gender          = models.CharField(max_length=10, choices=GENDER_CHOICES)
    address         = models.TextField(blank=True)
    enrollment_date = models.DateField()
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    photo           = models.ImageField(upload_to='students/', blank=True, null=True)
    created_at      = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'students'

    def __str__(self):
        return f"{self.user.get_full_name()} ({self.student_id})"


class ParentStudent(models.Model):
    RELATION_CHOICES = [('father', 'Ota'), ('mother', 'Ona'), ('guardian', 'Vasiy')]

    parent   = models.ForeignKey(User, on_delete=models.CASCADE,
                                 limit_choices_to={'role': 'parent'}, related_name='children')
    student  = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='parents')
    relation = models.CharField(max_length=20, choices=RELATION_CHOICES)

    class Meta:
        db_table = 'parent_student'
        unique_together = ['parent', 'student']

    def __str__(self):
        return f"{self.parent.get_full_name()} -> {self.student}"
