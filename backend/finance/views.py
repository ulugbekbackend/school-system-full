from rest_framework import generics

from users.permissions import IsAdminOrReadOnly, IsStaff

from .models import FeeType, Invoice, Payment
from .serializers import (FeeTypeSerializer, InvoiceSerializer,
                          PaymentSerializer)


class FeeTypeListCreateView(generics.ListCreateAPIView):
    queryset = FeeType.objects.all()
    serializer_class = FeeTypeSerializer
    permission_classes = [IsAdminOrReadOnly]


class FeeTypeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = FeeType.objects.all()
    serializer_class = FeeTypeSerializer
    permission_classes = [IsAdminOrReadOnly]


class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.select_related('student__user', 'fee_type').all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsStaff]
    filterset_fields = ['student', 'status', 'month', 'fee_type']
    ordering_fields = ['due_date', 'created_at']


class InvoiceDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer
    permission_classes = [IsStaff]


class PaymentListCreateView(generics.ListCreateAPIView):
    queryset = Payment.objects.select_related('invoice__student__user', 'invoice__fee_type').all()
    serializer_class = PaymentSerializer
    permission_classes = [IsStaff]
    filterset_fields = ['invoice', 'method']
    ordering_fields = ['paid_at', 'created_at']


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsStaff]
