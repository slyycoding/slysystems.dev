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

/* ─── Google Reviews ────────────────────────────────────────── */
(async () => {
  const GOOGLE_API_KEY = '';         // ← paste your Google Places API key here
  const PLACE_ID       = '';         // ← paste your Place ID here (see below)
  // To find your Place ID:
  //   1. Go to https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
  //   2. Search "Sly Systems Melbourne"
  //   3. Copy the Place ID (starts with ChIJ...)

  const track   = document.getElementById('reviewsTrack');
  const badge   = document.getElementById('ratingText');
  if (!track) return;

  if (!GOOGLE_API_KEY || !PLACE_ID) {
    track.innerHTML = `
      <div class="review-card" style="width:340px;">
        <div class="review-stars">★★★★★</div>
        <p class="review-text">Add your Google Places API key and Place ID to script.js to load live reviews automatically.</p>
        <div class="review-author">
          <div class="review-avatar">SS</div>
          <div><p class="review-author-name">Sly Systems</p><p class="review-author-date">Setup required</p></div>
        </div>
      </div>`;
    if (badge) badge.textContent = 'Google Reviews';
    return;
  }

  try {
    const res = await fetch(
      `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=reviews,rating,userRatingCount,displayName&key=${GOOGLE_API_KEY}`
    );
    const data = await res.json();

    if (badge && data.rating) {
      const stars = '★'.repeat(Math.round(data.rating)) + '☆'.repeat(5 - Math.round(data.rating));
      badge.textContent = `${data.rating} ${stars} · ${data.userRatingCount} reviews on Google`;
    }

    const reviews = data.reviews ?? [];
    if (!reviews.length) { track.innerHTML = '<p class="body-md text-muted" style="padding:2rem;">No reviews yet.</p>'; return; }

    const makeCard = r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      const initials = r.authorAttribution.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const date = new Date(r.publishTime).toLocaleDateString('en-AU', { month: 'short', year: 'numeric' });
      return `
        <div class="review-card">
          <div class="review-stars">${stars}</div>
          <p class="review-text">"${r.originalText?.text ?? r.text?.text ?? ''}"</p>
          <div class="review-author">
            ${r.authorAttribution.photoUri
              ? `<img src="${r.authorAttribution.photoUri}" class="review-avatar" alt="" />`
              : `<div class="review-avatar">${initials}</div>`}
            <div>
              <p class="review-author-name">${r.authorAttribution.displayName}</p>
              <p class="review-author-date">${date}</p>
            </div>
          </div>
        </div>`;
    };

    const cards = reviews.map(makeCard).join('');
    track.innerHTML = cards + cards; // duplicate for seamless loop
  } catch (err) {
    console.warn('Google Reviews failed to load:', err);
    if (badge) badge.textContent = 'See our reviews on Google';
    track.innerHTML = '<div class="review-placeholder glass-card"><p class="body-md text-muted" style="text-align:center;padding:2rem;">Reviews temporarily unavailable.</p></div>';
  }
})();

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
