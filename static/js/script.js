// Event Details and Registration Management
document.addEventListener('DOMContentLoaded', function() {
    console.log('Nexus of Things website loaded successfully!');
    
    // Modal elements
    const eventModal = document.getElementById('eventModal');
    const registrationModal = document.getElementById('registrationModal');
    const modalBody = document.getElementById('modal-body');
    
    // Event team requirements
    const eventRequirements = {
        'InnovWEB': { min: 1, max: 2 },
        'SensorShowDown': { min: 2, max: 3 },
        'IdeaArena': { min: 1, max: 2 },
        'Error Erase': { min: 1, max: 2 }
    };

    // ========== LOADING BUFFER FUNCTIONS ==========
    function showLoadingBuffer(message = 'Loading...') {
        const loadingBuffer = document.getElementById('loadingBuffer');
        const messageElement = loadingBuffer.querySelector('p');
        
        if (messageElement && message) {
            messageElement.textContent = message;
        }
        
        loadingBuffer.style.display = 'flex';
        loadingBuffer.offsetHeight; // Force reflow
        loadingBuffer.style.opacity = '1';
    }

    function hideLoadingBuffer() {
        const loadingBuffer = document.getElementById('loadingBuffer');
        loadingBuffer.style.opacity = '0';
        
        setTimeout(() => {
            loadingBuffer.style.display = 'none';
        }, 300);
    }

    // ========== VIEW MORE BUTTONS (with loading buffer) ==========
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
                    
                    // Display event details
                    displayEventDetails(data);
                    
                    // Show event modal
                    eventModal.style.display = 'block';
                })
                .catch(error => {
                    // HIDE LOADING BUFFER
                    hideLoadingBuffer();
                    console.error('Error:', error);
                    alert('Failed to load event details. Please try again.');
                });
        });
    });

    // ========== DISPLAY EVENT DETAILS ==========
    function displayEventDetails(eventData) {
        const requirements = eventRequirements[eventData.title] || { min: 1, max: 3 };
        
        // Generate student coordinators HTML
        let studentCoordinatorsHTML = '';
        if (eventData.student_coordinators && Array.isArray(eventData.student_coordinators)) {
            eventData.student_coordinators.forEach((coordinator, index) => {
                studentCoordinatorsHTML += `
                    <div class="coordinator-card">
                        <h4>Student Coordinator ${index + 1}</h4>
                        <p><strong>Name:</strong> ${coordinator.name || 'N/A'}</p>
                        <p><strong>Roll No:</strong> ${coordinator.roll_number || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${coordinator.phone || 'N/A'}</p>
                    </div>
                `;
            });
        }
        
        modalBody.innerHTML = `
            <div class="event-details">
                <h2>${eventData.title}</h2>
                
                <div class="event-info-section">
                    <h3>Description</h3>
                    <p>${eventData.description || 'No description available.'}</p>
                </div>
                
                ${eventData.rounds_info ? `<div class="event-info-section">
                    <h3>Event Structure</h3>
                    <p>${eventData.rounds_info}</p>
                </div>` : ''}
                
                ${eventData.rules ? `<div class="event-info-section">
                    <h3>Rules & Guidelines</h3>
                    <p>${eventData.rules}</p>
                </div>` : ''}
                
                <div class="coordinator-details">
                    <div class="coordinator-card">
                        <h4>Faculty Coordinator</h4>
                        <p><strong>Name:</strong> ${eventData.faculty_coordinator_name || 'N/A'}</p>
                        <p><strong>Designation:</strong> ${eventData.faculty_coordinator_designation || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${eventData.faculty_coordinator_phone || 'N/A'}</p>
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
        if (registerBtn) {
            // Remove any existing event listener first
            registerBtn.replaceWith(registerBtn.cloneNode(true));
            
            // Add new event listener
            modalBody.querySelector('.register-btn').addEventListener('click', function() {
                openRegistrationForm(eventData.title);
            });
        }
    }

    // ========== OPEN REGISTRATION FORM ==========
    function openRegistrationForm(eventName) {
        document.getElementById('registration-title').textContent = `Register for ${eventName}`;
        document.getElementById('event-name').value = eventName;
        
        // Generate teammate fields based on event requirements
        const requirements = eventRequirements[eventName] || { min: 1, max: 3 };
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

    // ========== REGISTRATION FORM SUBMISSION (Single handler) ==========
    const registrationForm = document.getElementById('registration-form');
    
    // Clone and replace form to remove any existing event listeners
    const newForm = registrationForm.cloneNode(true);
    registrationForm.parentNode.replaceChild(newForm, registrationForm);
    
    // Add single event listener to the new form
    document.getElementById('registration-form').addEventListener('submit', function(e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event bubbling
        
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
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(result => {
            // HIDE LOADING BUFFER
            hideLoadingBuffer();
            
            if (result.success) {
                // Close modal and reset form
                registrationModal.style.display = 'none';
                this.reset();
                
                // Show success message with team code
                alert(`Registration successful!\n\nYour Team Code: ${result.team_code}\nPlease save this code for future reference.`);
            } else {
                alert('Registration failed: ' + (result.message || 'Unknown error'));
            }
        })
        .catch(error => {
            // HIDE LOADING BUFFER
            hideLoadingBuffer();
            console.error('Error:', error);
            alert('Registration failed. Please check your connection and try again.');
        });
        
        // Prevent default form submission
        return false;
    });

    // ========== MODAL CLOSE FUNCTIONALITY ==========
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            eventModal.style.display = 'none';
            registrationModal.style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === eventModal || event.target === registrationModal) {
            eventModal.style.display = 'none';
            registrationModal.style.display = 'none';
        }
    });

    // ========== SMOOTH SCROLLING ==========
    document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Remove active class from all links
                document.querySelectorAll('nav a').forEach(link => {
                    link.classList.remove('active');
                });
                
                // Add active class to clicked link
                this.classList.add('active');
                
                // Calculate scroll position
                const header = document.querySelector('header');
                const headerHeight = header ? header.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - headerHeight;
                
                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========== UPDATE ACTIVE NAV LINK ON SCROLL ==========
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav a[href^="#"]');
        
        let currentSection = '';
        const scrollPosition = window.scrollY + 100; // Add offset
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ========== HEADER BACKGROUND ON SCROLL ==========
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.background = 'var(--white)';
            header.style.backdropFilter = 'none';
        }
        
        // Update active navigation link
        updateActiveNavLink();
    });

    // Initialize active nav link
    updateActiveNavLink();
});
