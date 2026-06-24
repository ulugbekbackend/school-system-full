from rest_framework import serializers

from .models import Grade, GradeCategory, TermReport


class GradeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeCategory
        fields = '__all__'


class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True, default='')

    class Meta:
        model = Grade
        fields = '__all__'
        read_only_fields = ['teacher']


class TermReportSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)

    class Meta:
        model = TermReport
        fields = '__all__'
