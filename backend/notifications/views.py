from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """Foydalanuvchi faqat o'z xabarnomalarini ko'radi."""
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['is_read', 'type']

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


class NotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        updated = Notification.objects.filter(pk=pk, recipient=request.user).update(is_read=True)
        if not updated:
            return Response({'detail': 'Topilmadi'}, status=404)
        return Response({'status': 'read'})


class NotificationMarkAllReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'marked': count})
