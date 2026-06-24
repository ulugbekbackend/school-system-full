from rest_framework.permissions import BasePermission, SAFE_METHODS


def _has_role(request, *roles):
    user = request.user
    return bool(user and user.is_authenticated and user.role in roles)


class IsAdmin(BasePermission):
    """Faqat admin / direktor."""
    def has_permission(self, request, view):
        return _has_role(request, 'admin')


class IsAdminOrReadOnly(BasePermission):
    """O'qish hammaga (authenticated), yozish faqat adminga."""
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return _has_role(request, 'admin')


class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, 'teacher')


class IsStaff(BasePermission):
    """HR yoki buxgalter (yoki admin)."""
    def has_permission(self, request, view):
        return _has_role(request, 'admin', 'hr', 'accountant')


class IsTeacherOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return _has_role(request, 'teacher', 'admin')


class IsOwnerOrAdmin(BasePermission):
    """Foydalanuvchi faqat o'z resursini, admin hammasini ko'radi."""
    def has_object_permission(self, request, view, obj):
        if _has_role(request, 'admin'):
            return True
        owner = getattr(obj, 'user', None) or getattr(obj, 'recipient', None) or obj
        return owner == request.user
