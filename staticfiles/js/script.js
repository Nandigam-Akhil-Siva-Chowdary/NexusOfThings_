// Event Details and Registration Management
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const eventModal = document.getElementById('eventModal');
    const registrationModal = document.getElementById('registrationModal');
    const modalBody = document.getElementById('modal-body');
    const closeButtons = document.querySelectorAll('.close');
    
    // Event team requirements
    const eventRequirements = {
        'InnovWEB': { min: 1, max: 2 },
        'SensorShowDown': { min: 2, max: 3 },
        'IdeaArena': { min: 1, max: 2 },
        'Error Erase': { min: 1, max: 2 }
    };

    // View More buttons
    const viewMoreButtons = document.querySelectorAll('.view-more-btn');
    
    viewMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventName = this.getAttribute('data-event');
            loadEventDetails(eventName);
        });
    });

    // Close modals
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            eventModal.style.display = 'none';
            registrationModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === eventModal) {
            eventModal.style.display = 'none';
        }
        if (event.target === registrationModal) {
            registrationModal.style.display = 'none';
        }
    });

    // Load event details from backend
    function loadEventDetails(eventName) {
        fetch(`/get-event-details/${eventName}/`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    modalBody.innerHTML = `<p>Error: ${data.error}</p>`;
                } else {
                    displayEventDetails(data);
                }
                eventModal.style.display = 'block';
            })
            .catch(error => {
                console.error('Error:', error);
                modalBody.innerHTML = '<p>Error loading event details</p>';
                eventModal.style.display = 'block';
            });
    }

// Display event details in modal
function displayEventDetails(eventData) {
    const requirements = eventRequirements[eventData.title];
    
    // Generate student coordinators HTML
    let studentCoordinatorsHTML = '';
    eventData.student_coordinators.forEach((coordinator, index) => {
        studentCoordinatorsHTML += `
            <div class="coordinator-card">
                <h4>Student Coordinator ${index + 1}</h4>
                <p><strong>Name:</strong> ${coordinator.name}</p>
                <p><strong>Roll No:</strong> ${coordinator.roll_number}</p>
                <p><strong>Phone:</strong> ${coordinator.phone}</p>
            </div>
        `;
    });
    
    modalBody.innerHTML = `
        <div class="event-details">
            <h2>${eventData.title}</h2>
            
            <div class="event-info-section">
                <h3>Description</h3>
                <p>${eventData.description}</p>
            </div>
            
            <div class="event-info-section">
                <h3>Event Structure</h3>
                <p>${eventData.rounds_info}</p>
            </div>
            
            <div class="event-info-section">
                <h3>Rules & Guidelines</h3>
                <p>${eventData.rules}</p>
            </div>
            
            <div class="coordinator-details">
                <div class="coordinator-card">
                    <h4>Faculty Coordinator</h4>
                    <p><strong>Name:</strong> ${eventData.faculty_coordinator_name}</p>
                    <p><strong>Designation:</strong> ${eventData.faculty_coordinator_designation}</p>
                    <p><strong>Phone:</strong> ${eventData.faculty_coordinator_phone}</p>
                </div>
                
                ${studentCoordinatorsHTML}
            </div>
            
            <div class="event-info-section">
                <h3>Team Requirements</h3>
                <p>Team Size: ${requirements.min}-${requirements.max} members</p>
            </div>
            
            <div class="event-info-section">
                <h3>Prizes</h3>
                <p>1st Prize: ₹3000 | 2nd Prize: ₹2000 | 3rd Prize: ₹1000</p>
            </div>
            
            <button class="btn btn-primary register-btn" data-event="${eventData.title}">
                Register Now
            </button>
        </div>
    `;

    // Add event listener to register button
    const registerBtn = modalBody.querySelector('.register-btn');
    registerBtn.addEventListener('click', function() {
        openRegistrationForm(eventData.title);
    });
}

    // Open registration form
    function openRegistrationForm(eventName) {
        document.getElementById('registration-title').textContent = `Register for ${eventName}`;
        document.getElementById('event-name').value = eventName;
        
        // Generate teammate fields based on event requirements
        const requirements = eventRequirements[eventName];
        const teammateFields = document.getElementById('teammate-fields');
        teammateFields.innerHTML = '';
        
        for (let i = 1; i < requirements.max; i++) {
            const required = i < requirements.min ? 'required' : '';
            teammateFields.innerHTML += `
                <div class="form-group">
                    <label for="teammate${i}_name">Teammate ${i} Name ${i < requirements.min ? '*' : ''}</label>
                    <input type="text" id="teammate${i}_name" name="teammate${i}_name" ${required}>
                </div>
            `;
        }
        
        eventModal.style.display = 'none';
        registrationModal.style.display = 'block';
    }

    // Handle registration form submission
    const registrationForm = document.getElementById('registration-form');
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/register-participant/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                registrationModal.style.display = 'none';
                registrationForm.reset();
            } else {
                alert('Registration failed: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // alert('Registration failed. Please try again.');
        });
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update active navigation link
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // Header background on scroll
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
        
        // Update active navigation link based on scroll position
        updateActiveNavLink();
    });

    // Update active navigation link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const headerHeight = document.querySelector('header').offsetHeight;
            
            if (window.scrollY >= sectionTop - headerHeight - 50 && 
                window.scrollY < sectionTop + sectionHeight - headerHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // Initialize active nav link
    updateActiveNavLink();
});



//;loading buffer

// ========== LOADING BUFFER FUNCTIONS (ONLY ADDITION) ==========
function showLoadingBuffer(message = 'Loading...') {
    const loadingBuffer = document.getElementById('loadingBuffer');
    const messageElement = loadingBuffer.querySelector('p');
    
    if (messageElement && message) {
        messageElement.textContent = message;
    }
    
    loadingBuffer.style.display = 'flex';
    // Force reflow for animation
    loadingBuffer.offsetHeight;
    loadingBuffer.style.opacity = '1';
}

function hideLoadingBuffer() {
    const loadingBuffer = document.getElementById('loadingBuffer');
    loadingBuffer.style.opacity = '0';
    
    setTimeout(() => {
        loadingBuffer.style.display = 'none';
    }, 300);
}

// ========== YOUR ORIGINAL CODE WITH LOADING BUFFER ADDED ==========
// Event Details Modal - MODIFIED TO ADD LOADING BUFFER
document.querySelectorAll('.view-more-btn').forEach(button => {
    button.addEventListener('click', function() {
        const eventName = this.getAttribute('data-event');
        
        // SHOW LOADING BUFFER
        showLoadingBuffer('Loading event details...');
        
        // Fetch event details from Django view
        fetch(`/get-event-details/${encodeURIComponent(eventName)}/`)
            .then(response => {
                if (!response.ok) throw new Error('Failed to load event details');
                return response.json();
            })
            .then(data => {
                // HIDE LOADING BUFFER
                hideLoadingBuffer();
                
                if (data.error) {
                    throw new Error(data.error);
                }
                
                // Your original modal population code
                populateEventModal(data, eventName);
                
                // Show event modal
                document.getElementById('eventModal').style.display = 'block';
            })
            .catch(error => {
                // HIDE LOADING BUFFER
                hideLoadingBuffer();
                console.error('Error:', error);
                alert('Failed to load event details. Please try again.');
            });
    });
});

// Populate Event Modal - YOUR ORIGINAL FUNCTION
function populateEventModal(eventData, eventName) {
    const modalBody = document.getElementById('modal-body');
    
    // Build student coordinators HTML
    let studentCoordsHTML = '';
    if (eventData.student_coordinators && eventData.student_coordinators.length > 0) {
        studentCoordsHTML = '<h4>Student Coordinators:</h4><ul>';
        eventData.student_coordinators.forEach(coord => {
            studentCoordsHTML += `<li>${coord.name} (${coord.roll_number}) - ${coord.phone}</li>`;
        });
        studentCoordsHTML += '</ul>';
    }
    
    modalBody.innerHTML = `
        <h3>${eventData.title || eventName}</h3>
        <p><strong>Description:</strong> ${eventData.description || 'No description available.'}</p>
        ${eventData.rounds_info ? `<p><strong>Rounds Info:</strong> ${eventData.rounds_info}</p>` : ''}
        ${eventData.rules ? `<p><strong>Rules:</strong> ${eventData.rules}</p>` : ''}
        ${eventData.faculty_coordinator_name ? `<p><strong>Faculty Coordinator:</strong> ${eventData.faculty_coordinator_name} (${eventData.faculty_coordinator_designation || ''}) - ${eventData.faculty_coordinator_phone || ''}</p>` : ''}
        ${studentCoordsHTML}
        
        <div style="margin-top: 30px;">
            <button class="btn btn-primary" onclick="openRegistration('${eventName}')">Register Now</button>
        </div>
    `;
}

// Open Registration Modal - YOUR ORIGINAL FUNCTION
function openRegistration(eventName) {
    document.getElementById('eventModal').style.display = 'none';
    document.getElementById('event-name').value = eventName;
    document.getElementById('registration-title').textContent = `Register for ${eventName}`;
    document.getElementById('registrationModal').style.display = 'block';
}

// Registration Form Submission - MODIFIED TO ADD LOADING BUFFER
document.getElementById('registration-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // SHOW LOADING BUFFER
    showLoadingBuffer('Processing registration...');
    
    // Collect form data
    const formData = new FormData(this);
    
    // Send to Django backend
    fetch('/register-participant/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            'X-Requested-With': 'XMLHttpRequest'
        }
    })
    .then(response => response.json())
    .then(result => {
        // HIDE LOADING BUFFER
        hideLoadingBuffer();
        
        if (result.success) {
            alert(result.message);
            // Close modal and reset form
            document.getElementById('registrationModal').style.display = 'none';
            this.reset();
            // Show team code
            if (result.team_code) {
                alert(`Your Team Code: ${result.team_code}\nPlease save this code for future reference.`);
            }
        } else {
            // alert('Registration failed: ' + (result.message || 'Unknown error'));
        }
    })
    .catch(error => {
        // HIDE LOADING BUFFER
        hideLoadingBuffer();
        console.error('Error:', error);
        // alert('Registration failed. Please check your connection and try again.');
    });
});

// ========== YOUR ORIGINAL MODAL CODE ==========
// Modal Close Functionality
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus of Things website loaded successfully!');
});