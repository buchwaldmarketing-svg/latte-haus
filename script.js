// ===== Open/closed status (Dallas time) =====
// Hours come from the Hours rows on the page (editable in Studio). HOURS is the fallback.
const HOURS = {
  0: { open: [8, 0], close: [11, 0] },
  1: { open: [7, 0], close: [19, 0] },
  2: { open: [7, 0], close: [19, 0] },
  3: { open: [7, 0], close: [19, 0] },
  4: { open: [7, 0], close: [19, 0] },
  5: { open: [7, 0], close: [19, 0] },
  6: { open: [8, 0], close: [16, 0] },
};
const DAY_NAMES = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function formatHour(h, m) {
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${ampm}` : `${h12}:${String(m).padStart(2, '0')}${ampm}`;
}

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
    days.forEach(d => { table[d] = times; });
  });
  return Object.keys(table).length ? table : null;
}

function updateStatus() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const today = (hoursFromPage() || HOURS)[now.getDay()];
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const isOpen = !!today && nowMin >= today.open[0] * 60 + today.open[1] && nowMin < today.close[0] * 60 + today.close[1];
  let text = 'Closed today';
  if (isOpen) text = `Open until ${formatHour(...today.close)}`;
  else if (today && nowMin < today.open[0] * 60 + today.open[1]) text = `Opens at ${formatHour(...today.open)}`;
  else if (today) text = 'Closed now';
  document.querySelectorAll('[data-status]').forEach(el => {
    el.classList.toggle('is-closed', !isOpen);
    el.querySelector('[data-status-text]').textContent = text;
  });
}
updateStatus();
setInterval(updateStatus, 60000);

// ===== Header: white text on the hero photo, solid white after =====
const header = document.getElementById('site-header');
const hero = document.querySelector('.hero');
const onScroll = () => {
  header.classList.toggle('scrolled', window.scrollY > 8);
  header.classList.toggle('on-photo', !!hero && window.scrollY < hero.offsetHeight - header.offsetHeight);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Menu pop-ups (regular + fall share one dialog). Without <dialog> support the links just open the PDF. =====
const MENUS = {
  main: { pdf: 'latte-haus-menu.pdf', img: 'images/menu.webp', phone: 'images/menu-mobile.webp', w: 1632, h: 2112, label: 'The menu', alt: 'The full Latte Haus menu: lattes, coffee, drinks and sweets with prices' },
  fall: { pdf: 'latte-haus-fall-menu.pdf', img: 'images/fall-menu.webp', phone: 'images/fall-menu-mobile.webp', w: 1632, h: 2112, label: 'The fall menu', alt: 'The Latte Haus fall menu: Calabasa Latte, Maple Cream Cold Brew and Churro Latte' },
};
const dlg = document.getElementById('menu-modal');
if (dlg && typeof dlg.showModal === 'function') {
  const img = dlg.querySelector('img');
  const source = dlg.querySelector('source');
  const root = document.documentElement;
  document.querySelectorAll('[data-menu]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const m = MENUS[link.dataset.menu] || MENUS.main;
      source.srcset = m.phone;
      img.src = m.img;
      img.width = m.w;
      img.height = m.h;
      img.alt = m.alt;
      dlg.querySelector('.mm-bar .label').textContent = m.label;
      dlg.querySelector('.mm-download').href = m.pdf;
      dlg.setAttribute('aria-label', `Latte Haus ${m.label.toLowerCase()}`);
      dlg.showModal();
      dlg.scrollTop = 0;
      root.style.overflow = 'hidden';
    });
  });
  const shut = () => { dlg.close(); root.style.overflow = ''; };
  dlg.querySelector('.mm-close').addEventListener('click', shut);
  dlg.addEventListener('click', e => { if (e.target === dlg) shut(); });
  dlg.addEventListener('close', () => { root.style.overflow = ''; }); // Esc key
}

// ===== Scroll reveals. Only tags what starts below the fold, so nothing is ever hidden without JS. =====
if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  const pending = [];
  document.querySelectorAll('.menu-card, .menu-copy, .menu-index, .story-photos, .story-copy, .quotes, .ig-head, .ig-grid, .order-photo, .order-copy, .visit').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.classList.add('will-reveal');
    io.observe(el);
    pending.push(el);
  });
  // Backup for browsers that pause or skip the observer: reveal anything that's already on screen.
  let ticking = false;
  const sweep = () => {
    ticking = false;
    pending.forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight * 0.95) el.classList.add('in'); });
  };
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; setTimeout(sweep, 60); } }, { passive: true });
  setTimeout(sweep, 1500);
}

