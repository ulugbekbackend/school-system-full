from django.db import models

from staff.models import Subject, Teacher
from students.models import Student


class GradeCategory(models.Model):
    name   = models.CharField(max_length=50)   # "Nazorat ishi", "Uy vazifasi"
    weight = models.FloatField(default=1.0)    # vazni (foizda)

    class Meta:
        db_table = 'grade_categories'
        verbose_name_plural = 'grade categories'

    def __str__(self):
        return self.name


class Grade(models.Model):
    TERM_CHOICES = [('1', '1-chorak'), ('2', '2-chorak'),
                    ('3', '3-chorak'), ('4', '4-chorak')]
    student       = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject       = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher       = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    category      = models.ForeignKey(GradeCategory, on_delete=models.SET_NULL, null=True, blank=True)
    score         = models.DecimalField(max_digits=5, decimal_places=2)
    max_score     = models.DecimalField(max_digits=5, decimal_places=2, default=100)
    term          = models.CharField(max_length=1, choices=TERM_CHOICES)
    academic_year = models.CharField(max_length=9)
    date          = models.DateField()
    comment       = models.CharField(max_length=300, blank=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'grades'

    def __str__(self):
        return f"{self.student} - {self.subject}: {self.score}"


class TermReport(models.Model):
    """Chorak yakuniy bahosi."""
    student         = models.ForeignKey(Student, on_delete=models.CASCADE)
    subject         = models.ForeignKey(Subject, on_delete=models.CASCADE)
    term            = models.CharField(max_length=1)
    academic_year   = models.CharField(max_length=9)
    final_score     = models.DecimalField(max_digits=5, decimal_places=2)
    grade_letter    = models.CharField(max_length=2)   # A, B, C, D, F
    teacher_comment = models.TextField(blank=True)

    class Meta:
        db_table = 'term_reports'
        unique_together = ['student', 'subject', 'term', 'academic_year']
