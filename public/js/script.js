const alert = document.querySelector('.alert');
const dismissBtn = document.querySelector('.dismiss-btn');

if (dismissBtn) {
  dismissBtn.addEventListener('click', function () {
    alert.style.display = 'none';
  });
}

// Booking model window
const modelOverlay = document.querySelector('.modal-overlay');
const closeBtn = document.querySelector('.modal-close-btn');
const reserveBtn = document.querySelector('#reserve-btn');

function openModal() {
  modelOverlay.classList.add('show');
}
function closeModel() {
  modelOverlay.classList.remove('show');
}

if (reserveBtn) {
  reserveBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModel);
}

// Getting current location
document.addEventListener('DOMContentLoaded', () => {
  const nearbyBtn = document.getElementById('find-nearby-btn');

  nearbyBtn.addEventListener('click', () => {
    navigator.geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        // Reverse Geocoding API (OpenStreetMap)
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        let response = await fetch(url);
        const data = await response.json();

        city = data.address.state_district.split(' ')[0];

        // let state = data.address.state;
        // let country = data.address.country;

        // console.log('City:', city);
        // console.log('State:', state);
        // console.log('Country:', country);

        window.location.href = `/listings/currentlocation?city=${city}`;
      },

      () => {
        console.log('Failed to get current location.');
      }
    );
  });
});
