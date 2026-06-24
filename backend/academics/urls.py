from django.urls import path

from .views import (MyScheduleView, RoomDetailView, RoomListCreateView,
                    ScheduleDetailView, ScheduleListCreateView,
                    TimeSlotDetailView, TimeSlotListCreateView)

urlpatterns = [
    path('timeslots/',         TimeSlotListCreateView.as_view()),
    path('timeslots/<int:pk>/', TimeSlotDetailView.as_view()),
    path('rooms/',             RoomListCreateView.as_view()),
    path('rooms/<int:pk>/',    RoomDetailView.as_view()),
    path('schedule/',          ScheduleListCreateView.as_view()),
    path('schedule/<int:pk>/', ScheduleDetailView.as_view()),
    path('my-schedule/',       MyScheduleView.as_view()),
]
