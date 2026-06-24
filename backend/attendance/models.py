from django.db import models

from staff.models import Subject, Teacher
from students.models import Student


class AttendanceRecord(models.Model):
    STATUS_CHOICES = [
        ('present', 'Keldi'),
        ('absent',  'Kelmadi'),
        ('late',    'Kech keldi'),
        ('excused', 'Uzrli'),
    ]
    student    = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance')
    teacher    = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    subject    = models.ForeignKey(Subject, on_delete=models.CASCADE)
    date       = models.DateField()
    status     = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    note       = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_records'
        unique_together = ['student', 'subject', 'date']

    def __str__(self):
        return f"{self.student} - {self.date} ({self.status})"
