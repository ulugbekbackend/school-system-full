from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsTeacherOrAdmin

from .models import (Assignment, Course, Lesson, Question, Quiz, Submission)
from .serializers import (AssignmentSerializer, CourseSerializer,
                          LessonSerializer, QuestionSerializer, QuizSerializer,
                          SubmissionSerializer)


class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.select_related('subject', 'teacher__user', 'school_class').all()
    serializer_class = CourseSerializer
    filterset_fields = ['teacher', 'school_class', 'subject', 'is_active', 'academic_year']
    search_fields = ['title']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]


class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsTeacherOrAdmin]


class LessonListCreateView(generics.ListCreateAPIView):
    queryset = Lesson.objects.prefetch_related('files').all()
    serializer_class = LessonSerializer
    filterset_fields = ['course']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]


class LessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsTeacherOrAdmin]


class AssignmentListCreateView(generics.ListCreateAPIView):
    queryset = Assignment.objects.select_related('course').all()
    serializer_class = AssignmentSerializer
    filterset_fields = ['course']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]


class AssignmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsTeacherOrAdmin]


class SubmissionListCreateView(generics.ListCreateAPIView):
    queryset = Submission.objects.select_related('student__user', 'assignment').all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['assignment', 'student']


class SubmissionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]


class QuizListCreateView(generics.ListCreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    filterset_fields = ['course']

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsTeacherOrAdmin()]
        return [IsAuthenticated()]


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    permission_classes = [IsTeacherOrAdmin]


class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.prefetch_related('choices').all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
    filterset_fields = ['quiz']


class QuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsTeacherOrAdmin]
