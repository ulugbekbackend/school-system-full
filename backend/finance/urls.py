from django.urls import path

from .views import (FeeTypeDetailView, FeeTypeListCreateView,
                    InvoiceDetailView, InvoiceListCreateView,
                    PaymentDetailView, PaymentListCreateView)

urlpatterns = [
    path('fee-types/',        FeeTypeListCreateView.as_view()),
    path('fee-types/<int:pk>/', FeeTypeDetailView.as_view()),
    path('invoices/',         InvoiceListCreateView.as_view()),
    path('invoices/<int:pk>/', InvoiceDetailView.as_view()),
    path('payments/',         PaymentListCreateView.as_view()),
    path('payments/<int:pk>/', PaymentDetailView.as_view()),
]
