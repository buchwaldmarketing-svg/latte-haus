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

// Hours come from the Hours list on the page (edited in Studio), so the badge always matches it.
// Falls back to HOURS above if the rows can't be read.
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
function parseDays(text) {
  const words = (text.match(/[A-Za-z]{3,}/g) || []).map(w => DAY_NAMES.indexOf(w.slice(0, 3).toLowerCase())).filter(i => i > -1);
  if (words.length === 2 && /(—|–|-|\bto\b|\bthrough\b|\bthru\b)/i.test(text)) {
    const out = [];
    for (let i = words[0], n = 0; n < 7; i = (i + 1) % 7, n++) { out.push(i); if (i === words[1]) break; }
    return out;
  }
  return words;
}
function parseTimes(text) {
  if (/closed/i.test(text)) return null;
  const t = [...text.matchAll(/(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)/gi)].map(m => [Number(m[1]) % 12 + (/p/i.test(m[3]) ? 12 : 0), Number(m[2] || 0)]);
  return t.length >= 2 ? { open: t[0], close: t[1] } : null;
}
function hoursFromPage() {
  const rows = [...document.querySelectorAll('.hours-grid > .hours-row')].filter(r => !r.hasAttribute('data-studio-orig'));
  const table = {};
  rows.forEach(r => {
    const days = parseDays(r.querySelector('.hours-day')?.textContent || '');
    const times = parseTimes(r.querySelector('.hours-time')?.textContent || '');
    days.forEach(d => { table[d] = times ? { ...times, label: `${formatHour(...times.open)} – ${formatHour(...times.close)}` } : null; });
  });
  return Object.keys(table).length ? table : null;
}

function computeStatus() {
  // Dallas time, not the visitor's clock.
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const table = hoursFromPage() || HOURS;
  const today = table[now.getDay()];
  if (!today) return { isOpen: false, closesLabel: '', opensLabel: '', todayLabel: 'Closed today' };
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

