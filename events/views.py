from django.shortcuts import render
from django.http import JsonResponse
from .models import Event, Participant, StudentCoordinator
import random
import string

def home(request):
    events = Event.objects.all()
    
    # Sample data for coordinators
    faculty_coordinators = [
        {
            'name': 'Dr N Nagamalleswara Rao',
            'designation': 'Professor & HOD, CSE-IoT',
            'phone': '+91 9490114628',
        },
        {
            'name': 'Dr Nageswara Rao Eluri',
            'designation': 'Associate Professor, CSE-IoT',
            'phone': '+91 8977782094',
        }
    ]
    
    student_coordinators = [
        {
            'name': 'SK. Hussen',
            'roll': 'Y23CO057',
            'phone': '+91 9014962753',
        },
        {
            'name': 'K. sai vrk',
            'roll': 'Y23CO019',
            'phone': '+91 7075044638',
        },
        {
            'name': 'N. Akhil Siva Chowdary',
            'roll': 'Y24CO033',
            'phone': '+91 7670855283',
        }     
    ]
    
    context = {
        'events': events,
        'faculty_coordinators': faculty_coordinators,
        'student_coordinators': student_coordinators,
    }
    return render(request, 'home.html', context)

def get_event_details(request, event_name):
    try:
        event = Event.objects.get(name=event_name)
        student_coordinators = event.student_coordinators.all()
        
        # Prepare student coordinators data
        student_coords_data = []
        for coordinator in student_coordinators:
            student_coords_data.append({
                'name': coordinator.name,
                'roll_number': coordinator.roll_number,
                'phone': coordinator.phone,
            })
        
        data = {
            'title': event.name,
            'description': event.description,
            'rounds_info': event.rounds_info,
            'rules': event.rules,
            'faculty_coordinator_name': event.faculty_coordinator_name,
            'faculty_coordinator_designation': event.faculty_coordinator_designation,
            'faculty_coordinator_phone': event.faculty_coordinator_phone,
            'student_coordinators': student_coords_data,
        }
        return JsonResponse(data)
    except Event.DoesNotExist:
        return JsonResponse({'error': 'Event not found'}, status=404)

def generate_team_code():
    # For MongoDB, we need to handle the ordering differently
    # Get the last participant ordered by registration_date instead of id
    last_participant = Participant.objects.order_by('-registration_date').first()
    if last_participant:
        last_code = last_participant.team_code
        # Extract the number from the code (format: NoT001#, NoT002#, etc.)
        try:
            number_str = last_code[3:6]  # Get the number part (001, 002, etc.)
            number = int(number_str) + 1
        except (ValueError, IndexError):
            number = 1
    else:
        number = 1
    return f"NoT{number:03d}#"

def register_participant(request):
    if request.method == 'POST':
        event = request.POST.get('event')
        team_name = request.POST.get('team_name')
        team_lead_name = request.POST.get('team_lead_name')
        college_name = request.POST.get('college_name')
        phone_number = request.POST.get('phone_number')
        email = request.POST.get('email')
        teammate1_name = request.POST.get('teammate1_name', '')
        teammate2_name = request.POST.get('teammate2_name', '')
        
        team_code = generate_team_code()
        
        participant = Participant(
            event=event,
            team_code=team_code,
            team_name=team_name,
            team_lead_name=team_lead_name,
            college_name=college_name,
            phone_number=phone_number,
            email=email,
            teammate1_name=teammate1_name,
            teammate2_name=teammate2_name
        )
        participant.save()
        
        return JsonResponse({
            'success': True,
            'team_code': team_code,
            'message': 'Registration successful! Your team code is: ' + team_code
        })
    
    return JsonResponse({'success': False, 'message': 'Invalid request method'})