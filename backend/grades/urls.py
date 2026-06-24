from django.urls import path

from .views import (GradeCategoryListCreateView, GradeDetailView,
                    GradeListCreateView, TermReportDetailView,
                    TermReportListCreateView)

urlpatterns = [
    path('categories/',       GradeCategoryListCreateView.as_view()),
    path('',                  GradeListCreateView.as_view()),
    path('<int:pk>/',         GradeDetailView.as_view()),
    path('term-reports/',     TermReportListCreateView.as_view()),
    path('term-reports/<int:pk>/', TermReportDetailView.as_view()),
]
