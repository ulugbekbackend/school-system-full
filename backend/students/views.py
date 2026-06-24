from rest_framework import filters, generics, status
from rest_framework.response import Response

from users.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Class, Student
from .serializers import (ClassSerializer, StudentCreateSerializer,
                          StudentSerializer)


class ClassListCreateView(generics.ListCreateAPIView):
    queryset = Class.objects.select_related('homeroom_teacher').all()
    serializer_class = ClassSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['name', 'academic_year']


class ClassDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Class.objects.all()
    serializer_class = ClassSerializer
    permission_classes = [IsAdminOrReadOnly]


class StudentListView(generics.ListAPIView):
    queryset = Student.objects.select_related('user', 'current_class').all()
    serializer_class = StudentSerializer
    filterset_fields = ['status', 'current_class', 'gender']
    search_fields = ['user__first_name', 'user__last_name', 'student_id']
    ordering_fields = ['created_at', 'user__last_name']


class StudentCreateView(generics.CreateAPIView):
    serializer_class = StudentCreateSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        out = StudentSerializer(student, context=self.get_serializer_context())
        return Response(out.data, status=status.HTTP_201_CREATED)


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Student.objects.select_related('user', 'current_class').all()
    serializer_class = StudentSerializer
    permission_classes = [IsAdminOrReadOnly]
