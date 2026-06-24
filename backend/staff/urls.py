from django.urls import path

from .views import (DepartmentDetailView, DepartmentListCreateView,
                    StaffMemberCreateView, StaffMemberDetailView,
                    StaffMemberListView, SubjectDetailView,
                    SubjectListCreateView, TeacherCreateView,
                    TeacherDetailView, TeacherListView)

urlpatterns = [
    path('departments/',          DepartmentListCreateView.as_view()),
    path('departments/<int:pk>/', DepartmentDetailView.as_view()),
    path('subjects/',             SubjectListCreateView.as_view()),
    path('subjects/<int:pk>/',    SubjectDetailView.as_view()),
    path('teachers/',             TeacherListView.as_view()),
    path('teachers/create/',      TeacherCreateView.as_view()),
    path('teachers/<int:pk>/',    TeacherDetailView.as_view()),
    path('members/',              StaffMemberListView.as_view()),
    path('members/create/',       StaffMemberCreateView.as_view()),
    path('members/<int:pk>/',     StaffMemberDetailView.as_view()),
]
