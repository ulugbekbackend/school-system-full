from django.db import models
from django.db.models import Sum

from students.models import Student


class FeeType(models.Model):
    FREQ_CHOICES = [('monthly', 'Oylik'), ('yearly', 'Yillik'), ('once', 'Bir martalik')]
    name         = models.CharField(max_length=100)
    amount       = models.DecimalField(max_digits=12, decimal_places=2)
    frequency    = models.CharField(max_length=20, choices=FREQ_CHOICES)
    is_mandatory = models.BooleanField(default=True)

    class Meta:
        db_table = 'fee_types'

    def __str__(self):
        return self.name


class Invoice(models.Model):
    STATUS_CHOICES = [
        ('pending',   'Kutilmoqda'),
        ('paid',      "To'langan"),
        ('overdue',   "Muddati o'tgan"),
        ('cancelled', 'Bekor qilingan'),
    ]
    student    = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='invoices')
    fee_type   = models.ForeignKey(FeeType, on_delete=models.CASCADE)
    amount     = models.DecimalField(max_digits=12, decimal_places=2)
    due_date   = models.DateField()
    status     = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pending')
    month      = models.CharField(max_length=7, blank=True)   # "2024-09"
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'invoices'

    def __str__(self):
        return f"{self.student} - {self.fee_type} ({self.amount})"

    @property
    def paid_amount(self):
        return self.payments.aggregate(s=Sum('amount'))['s'] or 0


class Payment(models.Model):
    METHOD_CHOICES = [
        ('cash',     'Naqd'),
        ('click',    'Click'),
        ('payme',    'Payme'),
        ('uzum',     'Uzum Bank'),
        ('transfer', "Bank o'tkazmasi"),
    ]
    invoice        = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name='payments')
    amount         = models.DecimalField(max_digits=12, decimal_places=2)
    method         = models.CharField(max_length=15, choices=METHOD_CHOICES)
    transaction_id = models.CharField(max_length=100, blank=True)
    paid_at        = models.DateTimeField()
    received_by    = models.CharField(max_length=100, blank=True)
    note           = models.CharField(max_length=300, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payments'

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # To'lov qo'shilgach invoice holatini avtomatik yangilaymiz (review I2).
        invoice = self.invoice
        if invoice.paid_amount >= invoice.amount and invoice.status != 'paid':
            invoice.status = 'paid'
            invoice.save(update_fields=['status'])

    def __str__(self):
        return f"{self.invoice} - {self.amount} ({self.method})"
