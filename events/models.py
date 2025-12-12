from django.db import models
from djongo import models as djongo_models

class Event(models.Model):
    EVENT_CHOICES = [
        ('InnovWEB', 'InnovWEB'),
        ('SensorShowDown', 'SensorShowDown'),
        ('IdeaArena', 'IdeaArena'),
        ('Error Erase', 'Error Erase'),
    ]
    
    # Use CharField with choices as before
    name = models.CharField(max_length=100, choices=EVENT_CHOICES)
    description = models.TextField()
    rounds_info = models.TextField()
    rules = models.TextField()
    faculty_coordinator_name = models.CharField(max_length=100)
    faculty_coordinator_designation = models.CharField(max_length=100)
    faculty_coordinator_phone = models.CharField(max_length=15)
    
    # MongoDB specific indexing for better performance
    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name

class StudentCoordinator(models.Model):
    # Use ForeignKey with to_field if you want to reference by name instead of ID
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='student_coordinators')
    name = models.CharField(max_length=100)
    roll_number = models.CharField(max_length=20)
    phone = models.CharField(max_length=15)
    
    class Meta:
        indexes = [
            models.Index(fields=['event', 'name']),
            models.Index(fields=['roll_number']),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.event.name}"

class Participant(models.Model):
    EVENT_CHOICES = [
        ('InnovWEB', 'InnovWEB'),
        ('SensorShowDown', 'SensorShowDown'),
        ('IdeaArena', 'IdeaArena'),
        ('Error Erase', 'Error Erase'),
    ]
    
    event = models.CharField(max_length=100, choices=EVENT_CHOICES)
    team_code = models.CharField(max_length=20, unique=True)
    team_name = models.CharField(max_length=100)
    team_lead_name = models.CharField(max_length=100)
    college_name = models.CharField(max_length=200)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField()
    teammate1_name = models.CharField(max_length=100, blank=True, null=True)
    teammate2_name = models.CharField(max_length=100, blank=True, null=True)
    registration_date = models.DateTimeField(auto_now_add=True)
    
    # MongoDB specific indexing
    class Meta:
        indexes = [
            models.Index(fields=['team_code']),
            models.Index(fields=['event', 'registration_date']),
            models.Index(fields=['team_name']),
            models.Index(fields=['email']),
        ]
    
    def __str__(self):
        return f"{self.team_code} - {self.team_name}"