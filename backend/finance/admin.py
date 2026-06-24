from django.contrib import admin

from .models import FeeType, Invoice, Payment

admin.site.register(FeeType)
admin.site.register(Invoice)
admin.site.register(Payment)
