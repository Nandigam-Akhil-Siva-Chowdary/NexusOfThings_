from django.contrib import admin
from django.urls import path
from events import views

urlpatterns = [
    path('admin-2310/', admin.site.urls),
    path('', views.home, name='home'),
    path('get-event-details/<str:event_name>/', views.get_event_details, name='get_event_details'),
    path('register-participant/', views.register_participant, name='register_participant'),
]