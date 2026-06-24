from django.contrib import admin

from .models import Room, Schedule, TimeSlot

admin.site.register(TimeSlot)
admin.site.register(Room)
admin.site.register(Schedule)
