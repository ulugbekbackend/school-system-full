from django.db import transaction
from rest_framework import serializers

from users.models import User

from .models import Department, StaffMember, Subject, Teacher


class DepartmentSerializer(serializers.ModelSerializer):
    head_name = serializers.CharField(source='head.get_full_name', read_only=True, default='')

    class Meta:
        model = Department
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default='')
    subject_names = serializers.SerializerMethodField()

    class Meta:
        model = Teacher
        fields = '__all__'

    def get_subject_names(self, obj):
        return [s.name for s in obj.subjects.all()]


class StaffMemberSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True, default='')

    class Meta:
        model = StaffMember
        fields = '__all__'


class _BaseEmployeeCreateSerializer(serializers.Serializer):
    """User + profil birga, bitta tranzaksiyada yaratiladi (M8)."""
    username   = serializers.CharField()
    email      = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField()
    last_name  = serializers.CharField()
    password   = serializers.CharField(write_only=True, min_length=6)
    phone      = serializers.CharField(required=False, allow_blank=True)
    hire_date  = serializers.DateField()
    salary     = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=0)
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(), required=False, allow_null=True)

    role = 'teacher'

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu login allaqachon band.")
        return value

    def _create_user(self, data):
        return User.objects.create_user(
            username=data['username'], email=data.get('email', ''),
            first_name=data['first_name'], last_name=data['last_name'],
            password=data['password'], phone=data.get('phone', ''), role=self.role)


class TeacherCreateSerializer(_BaseEmployeeCreateSerializer):
    role = 'teacher'
    teacher_id    = serializers.CharField()
    qualification = serializers.CharField(required=False, allow_blank=True)

    def create(self, validated_data):
        with transaction.atomic():
            user = self._create_user(validated_data)
            teacher = Teacher.objects.create(
                user=user, teacher_id=validated_data['teacher_id'],
                department=validated_data.get('department'),
                qualification=validated_data.get('qualification', ''),
                hire_date=validated_data['hire_date'],
                salary=validated_data.get('salary', 0))
        return teacher


class StaffMemberCreateSerializer(_BaseEmployeeCreateSerializer):
    staff_id = serializers.CharField()
    position = serializers.ChoiceField(choices=[c[0] for c in StaffMember.POSITION_CHOICES])

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # position -> role moslash (hr/accountant), aks holda 'hr'
        self.role = 'hr'

    def create(self, validated_data):
        role = validated_data['position'] if validated_data['position'] in ('hr', 'accountant') else 'hr'
        self.role = role
        with transaction.atomic():
            user = self._create_user(validated_data)
            staff = StaffMember.objects.create(
                user=user, staff_id=validated_data['staff_id'],
                position=validated_data['position'],
                department=validated_data.get('department'),
                hire_date=validated_data['hire_date'],
                salary=validated_data.get('salary', 0))
        return staff
