from django.db import models

from users.models import User


class LeaveType(models.Model):
    name     = models.CharField(max_length=50)   # "Yillik ta'til", "Kasallik"
    max_days = models.IntegerField()
    is_paid  = models.BooleanField(default=True)

    class Meta:
        db_table = 'leave_types'

    def __str__(self):
        return self.name


class LeaveRequest(models.Model):
    STATUS_CHOICES = [('pending', 'Kutilmoqda'), ('approved', 'Tasdiqlandi'),
                      ('rejected', 'Rad etildi')]
    employee    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type  = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date  = models.DateField()
    end_date    = models.DateField()
    reason      = models.TextField(blank=True)
    status      = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True,
                                    related_name='approved_leaves')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'leave_requests'

    @property
    def days(self):
        return (self.end_date - self.start_date).days + 1


class Payroll(models.Model):
    employee    = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payrolls')
    month       = models.CharField(max_length=7)   # "2024-09"
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    bonus       = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deduction   = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    net_salary  = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    paid        = models.BooleanField(default=False)
    paid_date   = models.DateField(null=True, blank=True)
    note        = models.CharField(max_length=300, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'payrolls'
        unique_together = ['employee', 'month']

    def save(self, *args, **kwargs):
        self.net_salary = self.base_salary + self.bonus - self.deduction
        super().save(*args, **kwargs)


class Inventory(models.Model):
    CATEGORY_CHOICES = [
        ('furniture', 'Mebel'), ('tech', 'Texnika'), ('book', 'Kitob'),
        ('sport', 'Sport jihozi'), ('other', 'Boshqa'),
    ]
    CONDITION_CHOICES = [('good', 'Yaxshi'), ('fair', 'Qoniqarli'), ('poor', 'Yomon')]

    name           = models.CharField(max_length=200)
    category       = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    quantity       = models.IntegerField(default=1)
    condition      = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='good')
    location       = models.CharField(max_length=100, blank=True)
    purchase_date  = models.DateField(null=True, blank=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    created_at     = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory'
        verbose_name_plural = 'inventory'

    def __str__(self):
        return f"{self.name} ({self.quantity})"
