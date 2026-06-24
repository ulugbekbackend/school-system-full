from django.db import models

from staff.models import Subject, Teacher
from students.models import Class, Student


class Course(models.Model):
    title         = models.CharField(max_length=200)
    subject       = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher       = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    school_class  = models.ForeignKey(Class, on_delete=models.CASCADE)
    description   = models.TextField(blank=True)
    academic_year = models.CharField(max_length=9)
    is_active     = models.BooleanField(default=True)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'courses'

    def __str__(self):
        return self.title


class Lesson(models.Model):
    course     = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title      = models.CharField(max_length=200)
    content    = models.TextField(blank=True)
    video_url  = models.URLField(blank=True)
    order      = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lessons'
        ordering = ['order']

    def __str__(self):
        return self.title


class LessonFile(models.Model):
    lesson      = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='files')
    file        = models.FileField(upload_to='lesson_files/')
    file_name   = models.CharField(max_length=200)
    file_type   = models.CharField(max_length=50, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lesson_files'


class Assignment(models.Model):
    course      = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignments')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date    = models.DateTimeField()
    max_score   = models.IntegerField(default=100)
    allow_late  = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assignments'

    def __str__(self):
        return self.title


class Submission(models.Model):
    assignment   = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student      = models.ForeignKey(Student, on_delete=models.CASCADE)
    content      = models.TextField(blank=True)
    file         = models.FileField(upload_to='submissions/', blank=True, null=True)
    score        = models.IntegerField(null=True, blank=True)
    feedback     = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_late      = models.BooleanField(default=False)

    class Meta:
        db_table = 'submissions'
        unique_together = ['assignment', 'student']


class Quiz(models.Model):
    course       = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title        = models.CharField(max_length=200)
    duration_min = models.IntegerField(default=30)
    start_time   = models.DateTimeField()
    end_time     = models.DateTimeField()
    max_attempts = models.IntegerField(default=1)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'quizzes'
        verbose_name_plural = 'quizzes'

    def __str__(self):
        return self.title


class Question(models.Model):
    TYPE_CHOICES = [('mcq', "Ko'p javobli"), ('true_false', "Ha/Yo'q"), ('short', 'Qisqa javob')]
    quiz   = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    text   = models.TextField()
    type   = models.CharField(max_length=15, choices=TYPE_CHOICES)
    points = models.IntegerField(default=1)
    order  = models.IntegerField(default=0)

    class Meta:
        db_table = 'questions'
        ordering = ['order']


class Choice(models.Model):
    question   = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    text       = models.CharField(max_length=500)
    is_correct = models.BooleanField(default=False)

    class Meta:
        db_table = 'choices'
