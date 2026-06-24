from rest_framework import generics

from users.permissions import IsStaff

from .models import Lead, LeadActivity
from .serializers import LeadActivitySerializer, LeadSerializer


class LeadListCreateView(generics.ListCreateAPIView):
    queryset = Lead.objects.select_related('assigned_to').prefetch_related('activities').all()
    serializer_class = LeadSerializer
    permission_classes = [IsStaff]
    filterset_fields = ['status', 'source', 'assigned_to']
    search_fields = ['child_name', 'parent_name', 'parent_phone']
    ordering_fields = ['created_at', 'updated_at']


class LeadDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    permission_classes = [IsStaff]


class LeadActivityListCreateView(generics.ListCreateAPIView):
    queryset = LeadActivity.objects.select_related('user', 'lead').all()
    serializer_class = LeadActivitySerializer
    permission_classes = [IsStaff]
    filterset_fields = ['lead']

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
