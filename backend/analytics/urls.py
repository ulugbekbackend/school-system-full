from django.urls import path

from .views import (AdminSummaryView, HRSummaryView, ParentSummaryView,
                    StudentSummaryView, TeacherSummaryView)

urlpatterns = [
    path('admin-summary/',   AdminSummaryView.as_view()),
    path('teacher-summary/', TeacherSummaryView.as_view()),
    path('student-summary/', StudentSummaryView.as_view()),
    path('parent-summary/',  ParentSummaryView.as_view()),
    path('hr-summary/',      HRSummaryView.as_view()),
]
