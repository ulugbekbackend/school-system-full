from django.urls import path

from .views import (AttendanceListCreateView, BulkAttendanceView,
                    StudentAttendanceSummaryView)

urlpatterns = [
    path('',                          AttendanceListCreateView.as_view()),
    path('bulk/',                     BulkAttendanceView.as_view()),
    path('summary/<int:student_id>/', StudentAttendanceSummaryView.as_view()),
]
