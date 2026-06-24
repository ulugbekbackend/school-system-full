from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from users.permissions import IsAdminOrReadOnly

from .models import Room, Schedule, TimeSlot
from .serializers import RoomSerializer, ScheduleSerializer, TimeSlotSerializer


class MyScheduleView(APIView):
    """Joriy foydalanuvchining haftalik jadvali (student → sinfi, teacher → o'zi)."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        qs = Schedule.objects.select_related(
            'subject', 'teacher__user', 'school_class', 'room', 'time_slot')
        if user.role == 'student':
            student = getattr(user, 'student_profile', None)
            if not student or not student.current_class:
                return Response({'days': []})
            qs = qs.filter(school_class=student.current_class)
        elif user.role == 'teacher':
            teacher = getattr(user, 'teacher_profile', None)
            if not teacher:
                return Response({'days': []})
            qs = qs.filter(teacher=teacher)
        else:
            return Response({'detail': 'Faqat talaba yoki o\'qituvchi uchun'}, status=400)

        data = ScheduleSerializer(qs.order_by('day_of_week', 'time_slot__order'), many=True).data
        return Response({'schedule': data})


class TimeSlotListCreateView(generics.ListCreateAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminOrReadOnly]


class TimeSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TimeSlot.objects.all()
    serializer_class = TimeSlotSerializer
    permission_classes = [IsAdminOrReadOnly]


class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]


class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]


class ScheduleListCreateView(generics.ListCreateAPIView):
    queryset = Schedule.objects.select_related(
        'subject', 'teacher__user', 'school_class', 'room', 'time_slot').all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAdminOrReadOnly]
    filterset_fields = ['school_class', 'teacher', 'day_of_week', 'academic_year']


class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer
    permission_classes = [IsAdminOrReadOnly]
