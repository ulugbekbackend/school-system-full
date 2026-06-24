from django.urls import path

from .views import (LeadActivityListCreateView, LeadDetailView,
                    LeadListCreateView)

urlpatterns = [
    path('leads/',          LeadListCreateView.as_view()),
    path('leads/<int:pk>/', LeadDetailView.as_view()),
    path('activities/',     LeadActivityListCreateView.as_view()),
]
