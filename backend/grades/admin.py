from django.contrib import admin

from .models import Grade, GradeCategory, TermReport

admin.site.register(GradeCategory)
admin.site.register(Grade)
admin.site.register(TermReport)
