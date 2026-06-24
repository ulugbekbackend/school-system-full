from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsStaff

from .models import Inventory, LeaveRequest, LeaveType, Payroll
from .serializers import (InventorySerializer, LeaveRequestSerializer,
                          LeaveTypeSerializer, PayrollSerializer)


class LeaveTypeListCreateView(generics.ListCreateAPIView):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [IsStaff]


class LeaveRequestListCreateView(generics.ListCreateAPIView):
    queryset = LeaveRequest.objects.select_related('employee', 'leave_type').all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsAuthenticated]   # har bir xodim o'z so'rovini yaratadi
    filterset_fields = ['status', 'employee', 'leave_type']

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)


class LeaveRequestDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LeaveRequest.objects.all()
    serializer_class = LeaveRequestSerializer
    permission_classes = [IsStaff]   # tasdiqlash/rad etish faqat HR/admin

    def perform_update(self, serializer):
        serializer.save(approved_by=self.request.user)


class PayrollListCreateView(generics.ListCreateAPIView):
    queryset = Payroll.objects.select_related('employee').all()
    serializer_class = PayrollSerializer
    permission_classes = [IsStaff]
    filterset_fields = ['employee', 'month', 'paid']


class PayrollDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [IsStaff]


class InventoryListCreateView(generics.ListCreateAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsStaff]
    filterset_fields = ['category', 'condition']
    search_fields = ['name', 'location']


class InventoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Inventory.objects.all()
    serializer_class = InventorySerializer
    permission_classes = [IsStaff]
