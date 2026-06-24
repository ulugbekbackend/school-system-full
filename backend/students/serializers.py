from django.db import transaction
from rest_framework import serializers

from users.models import User
from users.serializers import UserSerializer

from .models import Class, ParentStudent, Student


class ClassSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    homeroom_teacher_name = serializers.CharField(
        source='homeroom_teacher.get_full_name', read_only=True, default='')

    class Meta:
        model = Class
        fields = '__all__'

    def get_student_count(self, obj):
        return obj.students.filter(status='active').count()


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    current_class_name = serializers.CharField(source='current_class.name', read_only=True, default='')
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'


class StudentCreateSerializer(serializers.Serializer):
    # User fields
    username   = serializers.CharField()
    email      = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField()
    last_name  = serializers.CharField()
    password   = serializers.CharField(write_only=True, min_length=6)
    phone      = serializers.CharField(required=False, allow_blank=True)
    # Student fields
    student_id      = serializers.CharField()
    current_class   = serializers.PrimaryKeyRelatedField(queryset=Class.objects.all(), required=False, allow_null=True)
    date_of_birth   = serializers.DateField()
    gender          = serializers.ChoiceField(choices=['male', 'female'])
    address         = serializers.CharField(required=False, allow_blank=True)
    enrollment_date = serializers.DateField()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu login allaqachon band.")
        return value

    def validate_student_id(self, value):
        if Student.objects.filter(student_id=value).exists():
            raise serializers.ValidationError("Bu student ID allaqachon mavjud.")
        return value

    def create(self, validated_data):
        with transaction.atomic():
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                first_name=validated_data['first_name'],
                last_name=validated_data['last_name'],
                password=validated_data['password'],
                phone=validated_data.get('phone', ''),
                role='student',
            )
            student = Student.objects.create(
                user=user,
                student_id=validated_data['student_id'],
                current_class=validated_data.get('current_class'),
                date_of_birth=validated_data['date_of_birth'],
                gender=validated_data['gender'],
                address=validated_data.get('address', ''),
                enrollment_date=validated_data['enrollment_date'],
            )
        return student


class ParentStudentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    parent_name = serializers.CharField(source='parent.get_full_name', read_only=True)

    class Meta:
        model = ParentStudent
        fields = '__all__'
