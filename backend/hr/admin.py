from django.contrib import admin

from .models import Inventory, LeaveRequest, LeaveType, Payroll

admin.site.register(LeaveType)
admin.site.register(LeaveRequest)
admin.site.register(Payroll)
admin.site.register(Inventory)
