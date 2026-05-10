/* ============================================================
   Sly Systems — script.js  (homepage)
   ============================================================ */

/* ─── Scroll: sticky header ─────────────────────────────────── */
const header = document.getElementById('siteHeader');
if (header) {
  const tick = () => header.classList.toggle('scrolled', window.scrollY > 16);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}

/* ─── Mobile menu ────────────────────────────────────────────── */
const toggle  = document.getElementById('menuToggle');
const mobileNav = document.getElementById('mobileNav');

if (toggle && mobileNav) {
  toggle.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (mobileNav.classList.contains('open') &&
        !mobileNav.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  function closeMenu() {
    mobileNav.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ─── Scroll reveal ──────────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -32px 0px' });
  revealEls.forEach(el => io.observe(el));
}

/* ─── Active nav link on scroll ─────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-link');
if (sections.length && navLinks.length) {
  const map = {};
  navLinks.forEach(l => { map[l.getAttribute('href').slice(1)] = l; });
  const sio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        if (map[e.target.id]) map[e.target.id].classList.add('active');
      }
    });
  }, { rootMargin: '-38% 0px -56% 0px' });
  sections.forEach(s => sio.observe(s));
}

/* ─── Service select highlight ──────────────────────────────── */
const sel = document.getElementById('service');
if (sel) {
  const sync = () => sel.classList.toggle('filled', sel.value !== '');
  sel.addEventListener('change', sync);
  sync();
}

/* ─── Contact form ──────────────────────────────────────────── */
const form   = document.getElementById('contactForm');
const status = document.getElementById('formStatus');
if (form && status) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = 'Sending…';
    status.textContent = '';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!res.ok) throw new Error();
      form.reset();
      sel?.classList.remove('filled');
      status.style.color = '#86efac';
      status.textContent = '✓ Message sent — we\'ll be in touch soon.';
    } catch {
      status.style.color = '#ffb0b8';
      status.textContent = '✗ Something went wrong. Email us at sly@slysystems.dev';
    } finally {
      btn.disabled = false;
      btn.innerHTML = orig;
    }
  });
}

/* ─── Smooth scroll with header offset ──────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href').slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = (header?.offsetHeight ?? 68) + 10;
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  });
});
