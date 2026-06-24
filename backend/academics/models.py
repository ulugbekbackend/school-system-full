from django.db import models

from staff.models import Subject, Teacher
from students.models import Class


class TimeSlot(models.Model):
    name       = models.CharField(max_length=20)   # "1-dars"
    start_time = models.TimeField()
    end_time   = models.TimeField()
    order      = models.IntegerField()

    class Meta:
        db_table = 'time_slots'
        ordering = ['order']

    def __str__(self):
        return self.name


class Room(models.Model):
    ROOM_TYPES = [('class', 'Sinf'), ('lab', 'Laboratoriya'),
                  ('gym', 'Sport zal'), ('hall', 'Zal')]
    name      = models.CharField(max_length=50)
    capacity  = models.IntegerField(default=30)
    room_type = models.CharField(max_length=30, choices=ROOM_TYPES, default='class')

    class Meta:
        db_table = 'rooms'

    def __str__(self):
        return self.name


class Schedule(models.Model):
    DAY_CHOICES = [(1, 'Dushanba'), (2, 'Seshanba'), (3, 'Chorshanba'),
                   (4, 'Payshanba'), (5, 'Juma'), (6, 'Shanba')]
    school_class  = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedule')
    subject       = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher       = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    room          = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    time_slot     = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)
    day_of_week   = models.IntegerField(choices=DAY_CHOICES)
    academic_year = models.CharField(max_length=9)

    class Meta:
        db_table = 'schedules'
        unique_together = ['teacher', 'time_slot', 'day_of_week', 'academic_year']

    def __str__(self):
        return f"{self.school_class} - {self.subject} ({self.get_day_of_week_display()})"
