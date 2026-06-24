from rest_framework import serializers

from staff.models import Subject
from students.models import Student

from .models import AttendanceRecord


class AttendanceRecordSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = AttendanceRecord
        fields = '__all__'
        read_only_fields = ['teacher']


class BulkAttendanceItemSerializer(serializers.Serializer):
    """Bulk kiritish uchun bitta yozuv (teacher request.user dan olinadi)."""
    student = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all())
    subject = serializers.PrimaryKeyRelatedField(queryset=Subject.objects.all())
    date    = serializers.DateField()
    status  = serializers.ChoiceField(choices=[c[0] for c in AttendanceRecord.STATUS_CHOICES])
    note    = serializers.CharField(required=False, allow_blank=True)
