from django.urls import path

from .views import (AssignmentDetailView, AssignmentListCreateView,
                    CourseDetailView, CourseListCreateView, LessonDetailView,
                    LessonListCreateView, QuestionDetailView,
                    QuestionListCreateView, QuizDetailView, QuizListCreateView,
                    SubmissionDetailView, SubmissionListCreateView)

urlpatterns = [
    path('courses/',          CourseListCreateView.as_view()),
    path('courses/<int:pk>/', CourseDetailView.as_view()),
    path('lessons/',          LessonListCreateView.as_view()),
    path('lessons/<int:pk>/', LessonDetailView.as_view()),
    path('assignments/',      AssignmentListCreateView.as_view()),
    path('assignments/<int:pk>/', AssignmentDetailView.as_view()),
    path('submissions/',      SubmissionListCreateView.as_view()),
    path('submissions/<int:pk>/', SubmissionDetailView.as_view()),
    path('quizzes/',          QuizListCreateView.as_view()),
    path('quizzes/<int:pk>/', QuizDetailView.as_view()),
    path('questions/',        QuestionListCreateView.as_view()),
    path('questions/<int:pk>/', QuestionDetailView.as_view()),
]
