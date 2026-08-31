document.querySelectorAll('.sign-out').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('rescueit-current-user');
        window.location.href = 'Home.html';
    });
});

const notificationsContainer = document.querySelector('.notifications-container');

function loadDonations() {
    if (!notificationsContainer) return;

    const donations = JSON.parse(localStorage.getItem('rescueit-donations') || '[]');
    
    if (donations.length > 0) {
        donations.forEach(donation => {
            const card = document.createElement('div');
            card.className = 'notification-card';
            card.innerHTML = `
                <div class="card-info">
                    <h3>${donation.restaurantName}</h3>
                    <p>${donation.description}</p>
                    <div class="meta-info">
                        <span> Pickup today at ${donation.time}</span>
                        <span> New Donation</span>
                    </div>
                </div>
                <button class="btn-accept">Accept Donation</button>
            `;
            notificationsContainer.prepend(card);
        });
    }
}

loadDonations();

if (notificationsContainer) {
    notificationsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('btn-accept')) {
            const btn = e.target;
            Swal.fire({
                title: "Request Sent!",
                text: "Representative request sent successfully!",
                icon: "success"
            });
            btn.textContent = 'Requested';
            btn.disabled = true;
            btn.style.backgroundColor = '#CBD5E1';
            btn.style.cursor = 'default';
        }
    });
}
