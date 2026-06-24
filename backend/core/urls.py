from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/',          include('users.urls')),
    path('api/students/',      include('students.urls')),
    path('api/staff/',         include('staff.urls')),
    path('api/academics/',     include('academics.urls')),
    path('api/attendance/',    include('attendance.urls')),
    path('api/grades/',        include('grades.urls')),
    path('api/lms/',           include('lms.urls')),
    path('api/finance/',       include('finance.urls')),
    path('api/hr/',            include('hr.urls')),
    path('api/crm/',           include('crm.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/analytics/',     include('analytics.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
