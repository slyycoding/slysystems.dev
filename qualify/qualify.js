/* ============================================================
   Sly Systems — qualify.js
   ============================================================ */

/* ─── Sticky header ─────────────────────────────────────────── */
const header = document.getElementById('siteHeader');
if (header) {
  const tick = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}

/* ─── Mobile menu ────────────────────────────────────────────── */
const toggle    = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');
if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/* ─── Scroll reveal ─────────────────────────────────────────── */
const els = document.querySelectorAll('.reveal');
if (els.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -28px 0px' });
  els.forEach(el => io.observe(el));
}
