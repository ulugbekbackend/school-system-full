from django.contrib import admin

from .models import Class, ParentStudent, Student

admin.site.register(Class)
admin.site.register(Student)
admin.site.register(ParentStudent)
