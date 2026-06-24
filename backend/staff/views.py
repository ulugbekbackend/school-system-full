from rest_framework import generics, status
from rest_framework.response import Response

from users.permissions import IsAdmin, IsAdminOrReadOnly

from .models import Department, StaffMember, Subject, Teacher
from .serializers import (DepartmentSerializer, StaffMemberCreateSerializer,
                          StaffMemberSerializer, SubjectSerializer,
                          TeacherCreateSerializer, TeacherSerializer)


class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]


class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAdminOrReadOnly]


class SubjectListCreateView(generics.ListCreateAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    search_fields = ['name', 'code']


class SubjectDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAdminOrReadOnly]


class TeacherListView(generics.ListAPIView):
    queryset = Teacher.objects.select_related('user', 'department').all()
    serializer_class = TeacherSerializer
    filterset_fields = ['department', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'teacher_id']


class TeacherCreateView(generics.CreateAPIView):
    serializer_class = TeacherCreateSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        teacher = serializer.save()
        return Response(TeacherSerializer(teacher).data, status=status.HTTP_201_CREATED)


class TeacherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Teacher.objects.select_related('user', 'department').all()
    serializer_class = TeacherSerializer
    permission_classes = [IsAdminOrReadOnly]


class StaffMemberListView(generics.ListAPIView):
    queryset = StaffMember.objects.select_related('user', 'department').all()
    serializer_class = StaffMemberSerializer
    filterset_fields = ['department', 'position', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'staff_id']


class StaffMemberCreateView(generics.CreateAPIView):
    serializer_class = StaffMemberCreateSerializer
    permission_classes = [IsAdmin]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff = serializer.save()
        return Response(StaffMemberSerializer(staff).data, status=status.HTTP_201_CREATED)


class StaffMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = StaffMember.objects.select_related('user', 'department').all()
    serializer_class = StaffMemberSerializer
    permission_classes = [IsAdminOrReadOnly]
