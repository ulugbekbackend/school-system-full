from django.db.models import Count
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsTeacher, IsTeacherOrAdmin

from .models import AttendanceRecord
from .serializers import (AttendanceRecordSerializer,
                          BulkAttendanceItemSerializer)


class AttendanceListCreateView(generics.ListCreateAPIView):
    """GET — har bir rol o'ziga tegishlini ko'radi; POST — faqat teacher/admin."""
    serializer_class = AttendanceRecordSerializer
    filterset_fields = ['date', 'subject', 'status', 'student']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = AttendanceRecord.objects.select_related('student__user', 'subject', 'teacher__user')
        if user.role == 'student':
            return qs.filter(student__user=user)
        if user.role == 'parent':
            return qs.filter(student__parents__parent=user)
        return qs   # teacher / admin / staff

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, 'teacher_profile', None)
        serializer.save(teacher=teacher)


class BulkAttendanceView(APIView):
    """Bir kunda butun sinf uchun davomat kiritish."""
    permission_classes = [IsTeacher]

    def post(self, request):
        teacher = getattr(request.user, 'teacher_profile', None)
        if teacher is None:
            return Response({'detail': "O'qituvchi profili topilmadi"}, status=400)

        serializer = BulkAttendanceItemSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)

        count = 0
        for item in serializer.validated_data:
            AttendanceRecord.objects.update_or_create(
                student=item['student'], subject=item['subject'], date=item['date'],
                defaults={'status': item['status'], 'teacher': teacher,
                          'note': item.get('note', '')})
            count += 1
        return Response({'saved': count})


class StudentAttendanceSummaryView(APIView):
    """Talabaning davomat xulosasi."""
    permission_classes = [IsAuthenticated]

    def get(self, request, student_id):
        records = AttendanceRecord.objects.filter(student_id=student_id)
        summary = list(records.values('status').annotate(count=Count('id')))
        return Response({'total': records.count(), 'summary': summary})
