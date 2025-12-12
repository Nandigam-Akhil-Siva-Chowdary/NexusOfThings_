from django.contrib import admin
from .models import Event, StudentCoordinator, Participant

class StudentCoordinatorInline(admin.TabularInline):
    model = StudentCoordinator
    extra = 3  # Shows 3 empty forms by default
    max_num = 3  # Maximum 3 student coordinators per event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'faculty_coordinator_name']
    inlines = [StudentCoordinatorInline]

@admin.register(StudentCoordinator)
class StudentCoordinatorAdmin(admin.ModelAdmin):
    list_display = ['name', 'roll_number', 'phone', 'event']
    list_filter = ['event']
    search_fields = ['name', 'roll_number']

@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ['team_code', 'team_name', 'event', 'team_lead_name', 'college_name']
    list_filter = ['event']
    search_fields = ['team_code', 'team_name', 'team_lead_name']