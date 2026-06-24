from django.contrib import admin

from .models import (Assignment, Choice, Course, Lesson, LessonFile, Question,
                     Quiz, Submission)

admin.site.register(Course)
admin.site.register(Lesson)
admin.site.register(LessonFile)
admin.site.register(Assignment)
admin.site.register(Submission)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Choice)
