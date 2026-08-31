
function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('open');
}

function closeMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.remove('open');
}

window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 10) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    }
});

let timerInterval; 
let allMeals = []; 
let cart = [];

try {
    cart = JSON.parse(localStorage.getItem('rescueCart') || '[]');
} catch (err) {
    cart = [];
}

async function loadFood() {
    try {
        const response = await fetch('prac.json');
        const staticMeals = await response.json(); 
        
        const dynamicListings = JSON.parse(localStorage.getItem('rescueit-listings') || '[]');
        
        allMeals = [...dynamicListings, ...staticMeals];
        
        render(allMeals);
        setupFilters();
    } catch (err) {
        console.error("Data error:", err);
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Error loading data. Please try again later.</p>`;
    }
}
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter_btns button');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => {
                b.classList.remove('btn_all');
                b.style.backgroundColor = 'white';
                b.style.color = '#374151';
            });
            e.target.style.backgroundColor = '#059669';
            e.target.style.color = 'white';

            const category = e.target.dataset.category;
            render(category === 'all' ? allMeals : allMeals.filter(m => m.category === category));
        });
    });
}

const grid = document.querySelector('.product-grid');
const render = (meals) => {
    if (!grid) return;

    if (meals.length === 0) {
        grid.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">No food listings found.</p>`;
        return;
    }

    grid.innerHTML = meals.map(meal => `
        <div class="food-card">
            <div class="img-container" onclick="showMealDetails(${meal.id})" style="cursor:pointer;">
                <span class="discount-badge">${meal.discount}</span>
                <img src="${meal.image}" class="main-photo" alt="${meal.name}">
            </div>
            <div class="card-details">
                <h3 class="food-title">${meal.name}</h3>
                <div class="res-info">
                    <img src="${meal.logo}" class="res-logo" alt="logo">
                    <span class="res-name">${meal.restaurant}</span>
                </div>
                <div class="price-row">
                    <span class="new-price">${meal.newPrice} EGP</span>
                    <span class="old-price">${meal.oldPrice} EGP</span>
                </div>
                <button class="rescue-btn" onclick="showMealDetails(${meal.id})">More Details</button>
            </div>
        </div>
    `).join('');
};

loadFood();

const modal = document.getElementById('meal-modal');
const modalBody = document.getElementById('modal-body');
const closeBtn = document.querySelector('.close-modal');
function showMealDetails(id) {
    const meal = allMeals.find(m => m.id === id);
    if (!meal) return;

    clearInterval(timerInterval);
    const currentCount = cart.filter(item => item.id === id).length;
    const hoursInMs = (meal.hoursLeft || 3) * 60 * 60 * 1000;
    const targetTime = new Date().getTime() + hoursInMs;
    modalBody.innerHTML = `
        <img src="${meal.image}" class="modal-img">
        <div class="modal-info-padding">
            <h2 class="modal-title">${meal.name}</h2>
            <p class="modal-res-line">From <span class="res-name-bold">${meal.restaurant}</span></p>
            <p class="modal-desc">${meal.description || 'Delicious rescue meal saved just for you!'}</p>
            
            <div class="modal-price-cart-row">
                <div class="modal-price-row">
                    <span class="modal-new-price">${meal.newPrice} EGP</span>
                    <span class="modal-old-price">${meal.oldPrice} EGP</span>
                </div>

                <div class="modal-counter-btn-row">
                    <span id="item-counter">${currentCount}</span>
                    <button class="add-to-cart-icon-btn" onclick="addToCart(${meal.id})">
                        <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                </div>
            </div>

            <div class="expiry-container">
                <p class="expiry-label">EXPIRES IN</p>
                <p class="expiry-countdown" id="countdown-display">00:00:00</p>
            </div>
        </div>
    `;

    modal.style.display = 'flex'; 
    startDynamicCountdown(targetTime);
}

let toastTimer;

function showToast(text, isError = false) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = text;
    toast.classList.toggle('error', isError);
    toast.classList.add('show');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.remove('error');
    }, 2600);
}

function logout() {
    localStorage.removeItem('rescueit-current-user');
    showToast('Logged out successfully.');
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

function updateNavbar() {
    const user = getCurrentUser();
    const navCta = document.querySelectorAll('.nav-cta');

    if (user && user.name) {
        navCta.forEach(btn => {
            btn.innerHTML = `<i class="fa-solid fa-user me-2"></i> ${user.name.split(' ')[0]}`;
            btn.onclick = (e) => {
                e.preventDefault();
                Swal.fire({
                    title: 'Logout',
                    text: "Are you sure you want to logout?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#059669',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, logout'
                }).then((result) => {
                    if (result.isConfirmed) {
                        logout();
                    }
                });
            };
        });
    }
}

function startDynamicCountdown(targetTime) {
    const display = document.getElementById('countdown-display');
    
    function updateTimer() {
        const now = new Date().getTime();
        const diff = targetTime - now;

        if (diff <= 0) {
            clearInterval(timerInterval);
            display.innerHTML = "EXPIRED";
            return;
        }

        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        display.innerHTML = `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    updateTimer(); 
    timerInterval = setInterval(updateTimer, 1000);
}

const closeModal = () => {
    modal.style.display = 'none';
    clearInterval(timerInterval);
};

if(closeBtn) closeBtn.onclick = closeModal;
window.onclick = (e) => { if (e.target == modal) closeModal(); };

const cartBadge = document.querySelector('.cart-badge');
const cartOffcanvasBody = document.querySelector('#cartOffcanvas .offcanvas-body');
const cartTrigger = document.getElementById('cartTrigger');
const cartOffcanvasEl = document.getElementById('cartOffcanvas');
const emptyCartMessage = 'Your cart is empty. Please add items first.';

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('rescueit-current-user') || 'null');
    } catch (err) {
        return null;
    }
}

function requireLoginBeforeCart() {
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email) return true;

    showToast('Please login first to add items to your cart.', true);
    
    if (!window.location.hash.includes('auth')) {
        setTimeout(() => {
            window.location.href = 'Home.html#auth';
        }, 1500);
    }
    return false;
}

function stopEmptyCartAction(event) {
    if (cart.length > 0) return false;

    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
        event.stopImmediatePropagation();
    }
    showToast(emptyCartMessage, true);
    return true;
}

function addToCart(id) {
    if (!requireLoginBeforeCart()) return;

    const meal = allMeals.find(m => m.id === id);
    if (!meal) return;

    cart.push(meal);
    updateCartUI();
    
    const counter = document.getElementById('item-counter');
    if (counter) {
        counter.innerText = cart.filter(item => item.id === id).length;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
}

function updateCartUI() {
    cartBadge.innerText = cart.length;

    localStorage.setItem('rescueCart', JSON.stringify(cart));

    if (cart.length === 0) {
        cartOffcanvasBody.innerHTML = `<p class="text-muted text-center mt-4">Your items will appear here.</p>`;
    } else {
        cartOffcanvasBody.innerHTML = cart.map((item, index) => `
            <div class="cart-item">
                <img src="${item.image}" class="cart-item-img">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${item.newPrice} EGP</div>
                </div>
                <div class="remove-item" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash-alt"></i>
                </div>
            </div>
        `).join('');
    }
}

if (cartOffcanvasEl) {
    cartOffcanvasEl.addEventListener('show.bs.offcanvas', () => {
        cartTrigger.style.display = 'none';
    });
    cartOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        cartTrigger.style.display = 'block';
    });
}

document.querySelectorAll('[data-bs-target="#cartOffcanvas"]').forEach(button => {
    button.addEventListener('click', stopEmptyCartAction);
});

const checkoutLink = document.querySelector('.btn-checkout');
if (checkoutLink) {
    checkoutLink.addEventListener('click', (event) => {
        if (!requireLoginBeforeCart()) {
            event.preventDefault();
            return;
        }
        if (cart.length === 0) {
            event.preventDefault();
            showToast(emptyCartMessage, true);
        }
    });
}

updateNavbar();
updateCartUI();
