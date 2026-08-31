document.querySelectorAll('.sign-out').forEach(button => {
    button.addEventListener('click', (event) => {
        event.preventDefault();
        localStorage.removeItem('rescueit-current-user');
        window.location.href = 'Home.html';
    });
});

const listingForm = document.getElementById('listing-form');
if (listingForm) {
    listingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const foodName = document.getElementById('food-name').value;
        const description = document.getElementById('food-desc').value;
        const category = document.getElementById('food-category').value;
        const origPrice = parseFloat(document.getElementById('orig-price').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const finalPrice = parseFloat(document.getElementById('final-price').value) || 0;
        
        const currentUser = JSON.parse(localStorage.getItem('rescueit-current-user') || '{"name": "Local Restaurant"}');
        
        const newListing = {
            id: Date.now(),
            name: foodName,
            description: description,
            oldPrice: origPrice,
            newPrice: finalPrice,
            discount: discount + '% OFF',
            restaurant: currentUser.name,
            image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
            logo: 'https://cdn-icons-png.flaticon.com/512/1147/1147810.png',
            category: category,
            hoursLeft: 3
        };
        
        const listings = JSON.parse(localStorage.getItem('rescueit-listings') || '[]');
        listings.unshift(newListing);
        localStorage.setItem('rescueit-listings', JSON.stringify(listings));
        
        Swal.fire({
            title: "Success!",
            text: "Listing published successfully! It will now appear on the Available Food page.",
            icon: "success"
        });
        listingForm.reset();
    });
}

const donateForm = document.getElementById('donate-form');
if (donateForm) {
    donateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const charityId = document.getElementById('charity-select').value;
        const charityName = document.getElementById('charity-select').options[document.getElementById('charity-select').selectedIndex].text;
        const description = document.getElementById('donate-desc').value;
        
        const currentUser = JSON.parse(localStorage.getItem('rescueit-current-user') || '{"name": "Local Restaurant"}');
        
        const donation = {
            id: Date.now(),
            restaurantName: currentUser.name,
            charityId: charityId,
            charityName: charityName,
            description: description,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toLocaleDateString()
        };
        
        const donations = JSON.parse(localStorage.getItem('rescueit-donations') || '[]');
        donations.unshift(donation);
        localStorage.setItem('rescueit-donations', JSON.stringify(donations));
        
        Swal.fire({
            title: "Success!",
            text: 'Donation sent successfully to ' + charityName + '!',
            icon: "success"
        });
        donateForm.reset();
    });
}

const origPrice = document.getElementById('orig-price');
const discount = document.getElementById('discount');
const finalPrice = document.getElementById('final-price');

if (origPrice && discount && finalPrice) {
    const updatePrice = () => {
        const op = parseFloat(origPrice.value) || 0;
        const d = parseFloat(discount.value) || 0;
        const fp = op * (1 - d / 100);
        finalPrice.value = fp.toFixed(2);
    };
    origPrice.addEventListener('input', updatePrice);
    discount.addEventListener('input', updatePrice);
}
