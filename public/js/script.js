const alert = document.querySelector('.alert');
const dismissBtn = document.querySelector('.dismiss-btn');

if (dismissBtn) {
  dismissBtn.addEventListener('click', function () {
    alert.style.display = 'none';
  });
}
