from django.contrib import admin

from .models import Department, StaffMember, Subject, Teacher

admin.site.register(Department)
admin.site.register(Subject)
admin.site.register(Teacher)
admin.site.register(StaffMember)
