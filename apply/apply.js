/* ============================================================
   Sly Systems — apply.js
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
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    });
  }, { threshold: 0.06 });
  revealEls.forEach(el => io.observe(el));
}

/* ─── Progress bar ───────────────────────────────────────────── */
const REQUIRED_FIELDS = ['fullName', 'mobile', 'abn', 'businessName', 'businessEmail', 'industry'];
const progressFill   = document.getElementById('progressFill');
const progressPct    = document.getElementById('progressPct');
const progressFields = document.getElementById('progressFields');
const TOTAL          = REQUIRED_FIELDS.length + 1; // +1 for timeline radio

function updateProgress() {
  let filled = 0;
  REQUIRED_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.value.trim()) filled++;
  });
  if (document.querySelector('input[name="timeline"]:checked')) filled++;

  const pct = Math.round((filled / TOTAL) * 100);
  if (progressFill)   progressFill.style.width = pct + '%';
  if (progressPct)    progressPct.textContent   = pct + '% completed';
  if (progressFields) progressFields.textContent = filled + ' / ' + TOTAL + ' fields';
}

// Track all required field inputs + radio changes
REQUIRED_FIELDS.forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateProgress);
});
document.querySelectorAll('input[name="timeline"]').forEach(r => {
  r.addEventListener('change', updateProgress);
});

/* ─── Save draft (localStorage) ─────────────────────────────── */
const DRAFT_KEY = 'slysystems_draft';
const saveDraftBtn = document.getElementById('saveDraftBtn');

function getDraftData() {
  const data = {};
  REQUIRED_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) data[id] = el.value;
  });
  const details = document.getElementById('details');
  if (details) data.details = details.value;
  const tl = document.querySelector('input[name="timeline"]:checked');
  if (tl) data.timeline = tl.value;
  return data;
}

function loadDraft() {
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    if (!saved) return;
    const data = JSON.parse(saved);
    REQUIRED_FIELDS.forEach(id => {
      const el = document.getElementById(id);
      if (el && data[id]) el.value = data[id];
    });
    const details = document.getElementById('details');
    if (details && data.details) details.value = data.details;
    if (data.timeline) {
      const radio = document.querySelector(`input[name="timeline"][value="${data.timeline}"]`);
      if (radio) radio.checked = true;
    }
    updateProgress();
  } catch {}
}

if (saveDraftBtn) {
  saveDraftBtn.addEventListener('click', () => {
    const status = document.getElementById('applyStatus');
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(getDraftData()));
      if (status) { status.style.color = '#86efac'; status.textContent = '✓ Draft saved.'; }
    } catch {
      if (status) { status.style.color = '#ffb0b8'; status.textContent = 'Could not save draft.'; }
    }
  });
}

loadDraft();

/* ─── Form submission ────────────────────────────────────────── */
const applyForm   = document.getElementById('applyForm');
const applyStatus = document.getElementById('applyStatus');

if (applyForm && applyStatus) {
  applyForm.addEventListener('submit', async e => {
    e.preventDefault();
    applyStatus.textContent = '';

    // Client-side ABN check
    const abn = document.getElementById('abn');
    if (abn && !/^\d{11}$/.test(abn.value.trim())) {
      abn.classList.add('error');
      abn.focus();
      applyStatus.style.color = '#ffb0b8';
      applyStatus.textContent = '✗ Please enter a valid 11-digit ABN.';
      return;
    }
    abn?.classList.remove('error');

    const submitBtn = applyForm.querySelector('.apply-submit');
    const origHTML  = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending…';

    const payload = {
      fullName:      document.getElementById('fullName')?.value.trim()      || '',
      mobile:        document.getElementById('mobile')?.value.trim()        || '',
      abn:           abn?.value.trim()                                       || '',
      businessName:  document.getElementById('businessName')?.value.trim()  || '',
      businessEmail: document.getElementById('businessEmail')?.value.trim() || '',
      industry:      document.getElementById('industry')?.value.trim()      || '',
      details:       document.getElementById('details')?.value.trim()       || '',
      timeline:      document.querySelector('input[name="timeline"]:checked')?.value || '',
    };

    try {
      const res = await fetch('https://formspree.io/f/xqenglzz', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed.');
      }

      applyForm.reset();
      localStorage.removeItem(DRAFT_KEY);
      updateProgress();
      applyStatus.style.color = '#86efac';
      applyStatus.textContent = '✓ Application submitted! We\'ll be in touch within 24 hours.';
    } catch (err) {
      applyStatus.style.color = '#ffb0b8';
      applyStatus.textContent = '✗ ' + (err.message || 'Something went wrong. Try emailing sly@slysystems.dev');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHTML;
    }
  });
}
