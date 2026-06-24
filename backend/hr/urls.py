from django.urls import path

from .views import (InventoryDetailView, InventoryListCreateView,
                    LeaveRequestDetailView, LeaveRequestListCreateView,
                    LeaveTypeListCreateView, PayrollDetailView,
                    PayrollListCreateView)

urlpatterns = [
    path('leave-types/',      LeaveTypeListCreateView.as_view()),
    path('leaves/',           LeaveRequestListCreateView.as_view()),
    path('leaves/<int:pk>/',  LeaveRequestDetailView.as_view()),
    path('payroll/',          PayrollListCreateView.as_view()),
    path('payroll/<int:pk>/', PayrollDetailView.as_view()),
    path('inventory/',        InventoryListCreateView.as_view()),
    path('inventory/<int:pk>/', InventoryDetailView.as_view()),
]
