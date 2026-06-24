from rest_framework import serializers

from .models import Room, Schedule, TimeSlot


class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class ScheduleSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.user.get_full_name', read_only=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    room_name = serializers.CharField(source='room.name', read_only=True, default='')
    time = serializers.SerializerMethodField()
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = Schedule
        fields = '__all__'

    def get_time(self, obj):
        return f"{str(obj.time_slot.start_time)[:5]} - {str(obj.time_slot.end_time)[:5]}"
