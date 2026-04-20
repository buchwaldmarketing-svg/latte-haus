// ===== Open/Closed status =====
// Source of truth for hours — keep in sync with schema + location section
const HOURS = {
  0: { open: [8, 0],  close: [11, 0], label: '8am – 11am' }, // Sun
  1: { open: [7, 0],  close: [19, 0], label: '7am – 7pm' },
  2: { open: [7, 0],  close: [19, 0], label: '7am – 7pm' },
  3: { open: [7, 0],  close: [19, 0], label: '7am – 7pm' },
  4: { open: [7, 0],  close: [19, 0], label: '7am – 7pm' },
  5: { open: [7, 0],  close: [19, 0], label: '7am – 7pm' },
  6: { open: [8, 0],  close: [16, 0], label: '8am – 4pm' },  // Sat
};

function formatHour(h, m) {
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

function computeStatus() {
  const now = new Date();
  const today = HOURS[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const openMin = today.open[0] * 60 + today.open[1];
  const closeMin = today.close[0] * 60 + today.close[1];
  const isOpen = nowMin >= openMin && nowMin < closeMin;
  return {
    isOpen,
    closesLabel: formatHour(today.close[0], today.close[1]),
    opensLabel: formatHour(today.open[0], today.open[1]),
    todayLabel: today.label,
  };
}

function updateStatus() {
  const { isOpen, closesLabel, opensLabel, todayLabel } = computeStatus();

  // Sticky bar
  const bar = document.getElementById('status-bar');
  if (bar) {
    const dot = bar.querySelector('.status-dot');
    const label = bar.querySelector('.status-label');
    dot.classList.toggle('open', isOpen);
    dot.classList.toggle('closed', !isOpen);
    label.textContent = isOpen
      ? `Open Now · Until ${closesLabel}`
      : `Currently Closed`;
  }

  // Hero line
  const hero = document.getElementById('hero-status');
  const heroText = document.getElementById('hero-status-text');
  if (hero && heroText) {
    hero.classList.toggle('is-closed', !isOpen);
    heroText.textContent = isOpen
      ? `Open today until ${closesLabel}`
      : `Currently Closed`;
  }
}
updateStatus();
setInterval(updateStatus, 60000);

// ===== Nav + status bar scroll behavior =====
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const nav = document.getElementById('navbar');
  const bar = document.getElementById('status-bar');
  nav.classList.toggle('scrolled', y > 50);

  // Show sticky status bar once user scrolls past ~85% of hero
  const heroHeight = document.querySelector('.hero')?.offsetHeight || 600;
  const showStatus = y > heroHeight * 0.85;
  if (bar) {
    bar.classList.toggle('visible', showStatus);
    // Push nav down by exact bar height so they stack cleanly
    const barHeight = showStatus ? bar.offsetHeight : 0;
    nav.style.top = barHeight ? `${barHeight}px` : '';
  }
});

// Mobile menu toggle
function toggleMobile() {
  document.getElementById('mobileMenu').classList.toggle('open');
  document.body.classList.toggle('menu-open');
}

// Menu tab switching
function switchTab(tab) {
  document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  event.target.classList.add('active');
}

// Scroll reveal observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

