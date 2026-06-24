from django.urls import path

from .views import (ClassDetailView, ClassListCreateView, StudentCreateView,
                    StudentDetailView, StudentListView)

urlpatterns = [
    path('classes/',            ClassListCreateView.as_view()),
    path('classes/<int:pk>/',   ClassDetailView.as_view()),
    path('',                    StudentListView.as_view()),
    path('create/',             StudentCreateView.as_view()),
    path('<int:pk>/',           StudentDetailView.as_view()),
]
