let events = [];

const eventGrid = document.getElementById('eventGrid');
const bookingModal = document.getElementById('bookingModal');
const closeModal = document.querySelector('.close-modal'); // generic, maybe conflict
const ticketType = document.getElementById('ticketType');
const ticketQuantity = document.getElementById('ticketQuantity');
const totalAmount = document.getElementById('totalAmount');
const modalEventTitle = document.getElementById('modalEventTitle');
const confirmBookingBtn = document.getElementById('confirmBooking');

const authButtons = document.getElementById('authButtons');
const userProfile = document.getElementById('userProfile');
const usernameDisplay = document.getElementById('usernameDisplay');
const logoutBtn = document.getElementById('logoutBtn');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const authModal = document.getElementById('authModal');
const authClose = document.querySelector('.auth-close');
const tabLogin = document.getElementById('tabLogin');
const tabSignup = document.getElementById('tabSignup');
const authForm = document.getElementById('authForm');
const authUsername = document.getElementById('authUsername');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const authSubmitBtn = document.getElementById('authSubmitBtn');

let currentEvent = null;
let isLoginMode = true;
let currentUser = null;

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (user) {
        currentUser = JSON.parse(user);
        if (authButtons) authButtons.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');
        if (usernameDisplay) usernameDisplay.textContent = currentUser.username;
    } else {
        currentUser = null;
        if (authButtons) authButtons.classList.remove('hidden');
        if (userProfile) userProfile.classList.add('hidden');
    }
}

function init() {
    checkAuth();
    fetchEvents();
    setupEventListeners();
}

async function fetchEvents() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/events');
        const data = await response.json();
        if (data.message === 'success') {
            events = data.data;
            renderEvents();
        } else {
            console.error('Failed to fetch events:', data);
        }
    } catch (error) {
        console.error('Error fetching events:', error);
    }
}

// Render Events
function renderEvents() {
    eventGrid.innerHTML = '';
    
    events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.innerHTML = `
            <img src="${event.image}" alt="${event.title}" class="event-image">
            <div class="event-details">
                <div class="event-category">${event.category}</div>
                <h3 class="event-title" title="${event.title}">${event.title}</h3>
                <div class="event-info">
                    <span><i class="fa-regular fa-calendar"></i> ${event.date}</span>
                    <span><i class="fa-solid fa-location-dot"></i> ${event.location}</span>
                </div>
                <div class="event-footer">
                    <span class="event-price">$${event.price}</span>
                    <button class="btn-primary btn-sm" onclick="openModal(${event.id})">Book Ticket</button>
                </div>
            </div>
        `;
        eventGrid.appendChild(card);
    });
}

// Open Modal
window.openModal = function(eventId) {
    currentEvent = events.find(e => e.id === eventId);
    if (!currentEvent) return;

    modalEventTitle.textContent = `Book: ${currentEvent.title}`;
    
    // Update pricing options based on event base price
    ticketType.innerHTML = `
        <option value="standard" data-price="${currentEvent.price}">Standard - $${currentEvent.price}</option>
        <option value="vip" data-price="${Math.round(currentEvent.price * 2.5)}">VIP - $${Math.round(currentEvent.price * 2.5)}</option>
    `;
    
    ticketQuantity.value = 1;
    updateTotal();
    
    bookingModal.classList.add('active');
}

// Update Total Price
function updateTotal() {
    if (!currentEvent) return;
    const selectedOption = ticketType.options[ticketType.selectedIndex];
    const price = parseFloat(selectedOption.getAttribute('data-price'));
    const quantity = parseInt(ticketQuantity.value);
    
    totalAmount.textContent = (price * quantity).toFixed(2);
}

// Setup Event Listeners
function setupEventListeners() {
    // Close booking modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            bookingModal.classList.remove('active');
        });
    }

    // Auth Modal Listeners
    if (loginBtn) loginBtn.addEventListener('click', () => openAuthModal(true));
    if (signupBtn) signupBtn.addEventListener('click', () => openAuthModal(false));
    if (authClose) authClose.addEventListener('click', () => authModal.classList.remove('active'));
    
    if (tabLogin) tabLogin.addEventListener('click', () => switchAuthMode(true));
    if (tabSignup) tabSignup.addEventListener('click', () => switchAuthMode(false));

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('currentUser');
            checkAuth();
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', handleAuthSubmit);
    }

    window.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove('active');
        }
        if (e.target === authModal) {
            authModal.classList.remove('active');
        }
    });

    if (ticketType) ticketType.addEventListener('change', updateTotal);
    if (ticketQuantity) ticketQuantity.addEventListener('input', updateTotal);
    
    if (confirmBookingBtn) confirmBookingBtn.addEventListener('click', async () => {
        if (!currentUser) {
            alert('Please log in to book a ticket.');
            bookingModal.classList.remove('active');
            openAuthModal(true);
            return;
        }

        const btn = confirmBookingBtn;
        const originalText = btn.textContent;
        
        const bookingData = {
            eventId: currentEvent.id,
            ticketType: ticketType.value,
            quantity: parseInt(ticketQuantity.value),
            totalAmount: parseFloat(totalAmount.textContent)
        };

        btn.textContent = 'Processing...';
        btn.disabled = true;
        
        try {
            const response = await fetch('http://127.0.0.1:3000/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bookingData)
            });
            const data = await response.json();
            
            if (response.ok) {
                btn.textContent = 'Booking Confirmed!';
                btn.style.background = '#10b981'; // Green color for success
                
                setTimeout(() => {
                    bookingModal.classList.remove('active');
                    
                    // Reset button
                    setTimeout(() => {
                        btn.textContent = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 300);
                }, 1500);
            } else {
                alert('Booking failed: ' + (data.error || 'Unknown error'));
                btn.textContent = originalText;
                btn.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while booking. Please try again.');
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

function openAuthModal(isLogin) {
    switchAuthMode(isLogin);
    authModal.classList.add('active');
    authError.classList.add('hidden');
    authUsername.value = '';
    authPassword.value = '';
}

function switchAuthMode(isLogin) {
    isLoginMode = isLogin;
    if (isLogin) {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        authSubmitBtn.textContent = 'Log In';
    } else {
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
        authSubmitBtn.textContent = 'Sign Up';
    }
    authError.classList.add('hidden');
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const endpoint = isLoginMode ? 'http://127.0.0.1:3000/api/login' : 'http://127.0.0.1:3000/api/signup';
    
    authSubmitBtn.disabled = true;
    authSubmitBtn.textContent = 'Please wait...';
    authError.classList.add('hidden');
    
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: authUsername.value,
                password: authPassword.value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('currentUser', JSON.stringify(isLoginMode ? data.user : { username: data.username, id: data.userId }));
            checkAuth();
            authModal.classList.remove('active');
        } else {
            authError.textContent = data.error || 'Authentication failed';
            authError.classList.remove('hidden');
        }
    } catch (err) {
        authError.textContent = 'Server error. Please try again later.';
        authError.classList.remove('hidden');
    }
    
    authSubmitBtn.disabled = false;
    authSubmitBtn.textContent = isLoginMode ? 'Log In' : 'Sign Up';
}

// Run init when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
