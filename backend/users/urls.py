from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import CustomLoginView, MeView, UserDetailView, UserListCreateView

urlpatterns = [
    path('login/',          CustomLoginView.as_view()),
    path('token/refresh/',  TokenRefreshView.as_view()),
    path('me/',             MeView.as_view()),
    path('users/',          UserListCreateView.as_view()),
    path('users/<int:pk>/', UserDetailView.as_view()),
]
