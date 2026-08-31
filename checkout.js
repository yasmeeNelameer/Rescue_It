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

document.addEventListener('DOMContentLoaded', () => {
    const summaryItemsContainer = document.getElementById('summary-items');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('delivery-fee');
    const totalEl = document.getElementById('total');
    const checkoutForm = document.getElementById('checkout-form');
    const deliveryFee = 3.50;


    const savedCart = localStorage.getItem('rescueCart');
    let cart = [];

    try {
        cart = savedCart ? JSON.parse(savedCart) : [];
    } catch (err) {
        cart = [];
    }

    const getItemPrice = item => Number(item.newPrice) || 0;

    if (cart.length > 0) {

        const groupedCart = cart.reduce((acc, item) => {
            if (!acc[item.id]) {
                acc[item.id] = { ...item, quantity: 0 };
            }
            acc[item.id].quantity += 1;
            return acc;
        }, {});

        summaryItemsContainer.innerHTML = Object.values(groupedCart).map(item => `
            <div class="summary-item">
                <span class="summary-item-name">${item.name} &times; ${item.quantity}</span>
                <span class="summary-item-price">${(getItemPrice(item) * item.quantity).toFixed(2)} EGP</span>
            </div>
        `).join('');


        const subtotal = cart.reduce((sum, item) => sum + getItemPrice(item), 0);
        subtotalEl.innerText = `${subtotal.toFixed(2)} EGP`;
        deliveryFeeEl.innerText = `${deliveryFee.toFixed(2)} EGP`;
        totalEl.innerText = `${(subtotal + deliveryFee).toFixed(2)} EGP`;
    } else {
        summaryItemsContainer.innerHTML = `<p class="text-muted text-center py-3">Your cart is empty.</p>`;
        subtotalEl.innerText = `0.00 EGP`;
        deliveryFeeEl.innerText = `0.00 EGP`;
        totalEl.innerText = `0.00 EGP`;
    }

    document.querySelector('.btn-confirm').addEventListener('click', () => {
        if (cart.length === 0) {
            Swal.fire({
                title: "Wait!",
                text: "Your cart is empty. Please add items before confirming your order.",
                icon: "warning"
            });
            return;
        }

        if (!checkoutForm.checkValidity()) {
            Swal.fire({
                title: "Incomplete Details",
                text: "Please fill out all required fields correctly before confirming your order.",
                icon: "warning"
            });
            checkoutForm.reportValidity();
            return;
        }

        Swal.fire({
            title: "Order Confirmed!",
            text: "Thank you for rescuing food.",
            icon: "success"
        }).then(() => {
            localStorage.removeItem('rescueCart');
            window.location.href = 'prac.html';
        });
    });
});
