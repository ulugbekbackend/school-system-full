from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsAdminOrReadOnly, IsTeacherOrAdmin

from .models import Grade, GradeCategory, TermReport
from .serializers import (GradeCategorySerializer, GradeSerializer,
                          TermReportSerializer)


class GradeCategoryListCreateView(generics.ListCreateAPIView):
    queryset = GradeCategory.objects.all()
    serializer_class = GradeCategorySerializer
    permission_classes = [IsAdminOrReadOnly]


class GradeListCreateView(generics.ListCreateAPIView):
    """GET — har bir rol o'ziga tegishlini ko'radi; POST — faqat teacher/admin."""
    serializer_class = GradeSerializer
    filterset_fields = ['student', 'subject', 'term', 'academic_year']
    ordering_fields = ['date', 'score']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Grade.objects.select_related('student__user', 'subject', 'category')
        if user.role == 'student':
            return qs.filter(student__user=user)
        if user.role == 'parent':
            return qs.filter(student__parents__parent=user)
        return qs   # teacher / admin / staff

    def perform_create(self, serializer):
        teacher = getattr(self.request.user, 'teacher_profile', None)
        serializer.save(teacher=teacher)


class GradeDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Grade.objects.all()
    serializer_class = GradeSerializer
    permission_classes = [IsTeacherOrAdmin]


class TermReportListCreateView(generics.ListCreateAPIView):
    queryset = TermReport.objects.select_related('student__user', 'subject').all()
    serializer_class = TermReportSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['student', 'subject', 'term', 'academic_year']


class TermReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TermReport.objects.all()
    serializer_class = TermReportSerializer
    permission_classes = [IsTeacherOrAdmin]
