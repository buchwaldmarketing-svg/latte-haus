// Nav scroll effect
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// Mobile menu toggle
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

// Menu tab switching
function switchTab(tab) {
  document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
}

// Promo banner dismiss
function dismissBanner() {
  document.getElementById('promoBanner').classList.add('hidden');
  sessionStorage.setItem('promoDismissed', 'true');
}

// Hide banner if already dismissed this session
if (sessionStorage.getItem('promoDismissed') === 'true') {
  const banner = document.getElementById('promoBanner');
  if (banner) banner.classList.add('hidden');
}

// Scroll reveal observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Generic form handler (works for all Formspree forms on the page)
function handleFormSubmit(form, successEl) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.style.display = 'none';
        successEl.style.display = 'block';
      }
    } catch {
      form.style.display = 'none';
      successEl.style.display = 'block';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Order section signup form
  const signupForm = document.getElementById('signupForm');
  const signupSuccess = document.getElementById('signupSuccess');
  if (signupForm && signupSuccess) handleFormSubmit(signupForm, signupSuccess);

  // Footer signup form
  const footerForm = document.getElementById('footerSignupForm');
  const footerSuccess = document.getElementById('footerSignupSuccess');
  if (footerForm && footerSuccess) handleFormSubmit(footerForm, footerSuccess);
});
