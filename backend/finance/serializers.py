from rest_framework import serializers

from .models import FeeType, Invoice, Payment


class FeeTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = FeeType
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    method_display = serializers.CharField(source='get_method_display', read_only=True)

    class Meta:
        model = Payment
        fields = '__all__'


class InvoiceSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    fee_type_name = serializers.CharField(source='fee_type.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    paid_amount = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = '__all__'

    def get_paid_amount(self, obj):
        return float(obj.paid_amount)
