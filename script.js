const CONFIG = {
  name: "Sly",
  instagramUrl: "https://www.instagram.com/sly.jpeg/",
  twitterUrl: "https://x.com/redwristsly",
  githubUrl: "https://github.com/slyycoding",
  githubUser: "slyycoding",
  email: "slysystemsdev@gmail.com",
  discord: "selectivesly",
  repoLimit: 9,
  instaPosts: []
};

const $ = (q) => document.querySelector(q);

function setLinks(){
  const a=$("#linkInsta"); if(a) a.href=CONFIG.instagramUrl;
  const b=$("#linkTwitter"); if(b) b.href=CONFIG.twitterUrl;
  const c=$("#linkGithub"); if(c) c.href=CONFIG.githubUrl;
  const d=$("#workInstaBtn"); if(d) d.href=CONFIG.instagramUrl;
  const e=$("#emailText"); if(e) e.textContent=CONFIG.email;
  const f=$("#discordText"); if(f) f.textContent=CONFIG.discord;
  document.title = `${CONFIG.name} | Smooth Operator`;

}

function setYear(){ const y = $("#year"); if(y) y.textContent = new Date().getFullYear(); }

function toast(msg){
  const el = $("#copyToast");
  if(!el) return;
  el.textContent = msg;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ el.textContent=""; }, 1800);
}

async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch{ return false; }
}

function bindCopy(){
  const a = $("#copyEmailBtn");
  if(a) a.addEventListener("click", async ()=>{ toast((await copyToClipboard(CONFIG.email)) ? "Email copied ✓" : "Copy failed"); });
  const b = $("#copyDiscordBtn");
  if(b) b.addEventListener("click", async ()=>{ toast((await copyToClipboard(CONFIG.discord)) ? "Discord copied ✓" : "Copy failed"); });
}

function bindSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener("click", (e)=>{
      const id = a.getAttribute("href");
      const t = document.querySelector(id);
      if(!t) return;
      e.preventDefault();
      t.scrollIntoView({ behavior:"smooth", block:"start" });
    });
  });
}

function bindFxToggle(){
  const btn = $("#fxBtn");
  if(!btn) return;
  let on = true;
  const apply = () => {
    document.documentElement.style.setProperty("--fxOn", on ? "1" : "0");
    btn.textContent = on ? "FX" : "FX OFF";
    btn.style.opacity = on ? "1" : "0.7";
  };
  btn.addEventListener("click", ()=>{ on = !on; apply(); });
  apply();
}

function bindContactForm(){
  const f = $("#contactForm");
  if(!f) return;
  f.addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = new FormData(e.target);
    const name = (data.get("name") || "Someone").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const subject = encodeURIComponent(`Website contact from ${name}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  });
}

function renderInstagramEmbeds(){
  const grid = $("#instaGrid");
  if(!grid) return;
  if(!CONFIG.instaPosts || CONFIG.instaPosts.length === 0) return;
  grid.innerHTML = "";
  for(const url of CONFIG.instaPosts){
    const wrap = document.createElement("div");
    wrap.className = "instaEmbed";
    wrap.innerHTML = `
      <blockquote class="instagram-media"
        data-instgrm-permalink="${escapeHtml(url)}"
        data-instgrm-version="14"
        style="margin:0; min-width:0; width:100%;">
      </blockquote>
    `;
    grid.appendChild(wrap);
  }
  refreshInstagramEmbeds();
}

function refreshInstagramEmbeds(){
  try{
    if(window.instgrm?.Embeds?.process) window.instgrm.Embeds.process();
  }catch{}
}

function bindEmbedRefresh(){
  const b = $("#refreshEmbedsBtn");
  if(!b) return;
  b.addEventListener("click", ()=>{
    refreshInstagramEmbeds();
    toast("Embeds refreshed ✓");
  });
}

async function fetchRepos(){
  const status = $("#statusText");
  try{
    if(status) status.textContent = "Fetching GitHub…";
    const res = await fetch(`https://api.github.com/users/${CONFIG.githubUser}/repos?per_page=100&sort=updated`);
    if(!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const repos = await res.json();

    const list = repos
      .filter(r => !r.fork)
      .map(r => ({
        name: r.name,
        url: r.html_url,
        desc: r.description || "No description provided.",
        stars: r.stargazers_count || 0,
        lang: r.language || "—",
        updated: r.updated_at
      }));

    if(status) status.textContent = "GitHub loaded ✓";
    const note = $("#githubNote"); if(note) note.textContent = "";

    initRepoUI(list);
    updateStats(list);
  }catch(e){
    if(status) status.textContent = "GitHub unavailable";
    const note = $("#githubNote"); if(note) note.textContent = "GitHub API can rate-limit — refresh later if it fails.";
    const wrap = $("#repoList");
    if(wrap) wrap.innerHTML = `<div class="card">Could not load repos. ${escapeHtml(String(e.message))}</div>`;
  }
}

function updateStats(repos){
  const shown = repos.slice(0, CONFIG.repoLimit);
  const stars = repos.reduce((s,r)=> s + (r.stars||0), 0);
  const langs = {};
  repos.forEach(r=>{
    if(!r.lang || r.lang === "—") return;
    langs[r.lang] = (langs[r.lang] || 0) + 1;
  });
  const topLangs = Object.entries(langs).sort((a,b)=>b[1]-a[1]).slice(0,3).map(x=>x[0]);

  const a = $("#repoCount"); if(a) a.textContent = shown.length;
  const b = $("#starCount"); if(b) b.textContent = stars;
  const c = $("#langCount"); if(c) c.textContent = topLangs.length ? topLangs.join(", ") : "—";
}

function renderRepos(list){
  const wrap = $("#repoList");
  if(!wrap) return;
  if(!list.length){
    wrap.innerHTML = `<div class="card">No repos matched your search.</div>`;
    return;
  }
  wrap.innerHTML = list.slice(0, CONFIG.repoLimit).map(r => `
    <a class="repoCard" href="${r.url}" target="_blank" rel="noreferrer">
      <div class="repoTop">
        <div class="repoName">${escapeHtml(r.name)}</div>
        <div class="badge">★ ${r.stars}</div>
      </div>
      <p class="repoDesc">${escapeHtml(r.desc)}</p>
      <div class="repoMeta">
        <span class="badge">${escapeHtml(r.lang)}</span>
        <span class="badge">Updated: ${formatDate(r.updated)}</span>
      </div>
    </a>
  `).join("");
}

function initRepoUI(repos){
  const search = $("#repoSearch");
  const sort = $("#repoSort");
  if(!search || !sort){
    renderRepos(repos);
    return;
  }
  let state = { q:"", sort:"updated" };

  const apply = () => {
    const q = state.q.trim().toLowerCase();
    let list = repos.filter(r =>
      r.name.toLowerCase().includes(q) ||
      (r.desc || "").toLowerCase().includes(q) ||
      (r.lang || "").toLowerCase().includes(q)
    );

    if(state.sort === "updated") list.sort((a,b)=> new Date(b.updated) - new Date(a.updated));
    if(state.sort === "stars") list.sort((a,b)=> (b.stars||0)-(a.stars||0));
    if(state.sort === "name") list.sort((a,b)=> a.name.localeCompare(b.name));

    renderRepos(list);
  };

  search.addEventListener("input", e=>{ state.q = e.target.value; apply(); });
  sort.addEventListener("change", e=>{ state.sort = e.target.value; apply(); });

  renderRepos(repos);
}

function formatDate(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"2-digit" });
  }catch{ return "—"; }
}

function initBackground(){
  const canvas = $("#bg");
  if(!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  let w = 0, h = 0;
  const rand = (min, max) => Math.random() * (max - min) + min;

  function resize(){
    w = Math.floor(window.innerWidth);
    h = Math.floor(window.innerHeight);
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  const count = Math.max(52, Math.min(140, Math.floor((w * h) / 15000)));
  const shards = Array.from({ length: count }, () => ({
    x: rand(0,1), y: rand(0,1),
    vx: rand(-0.00028, 0.00028),
    vy: rand(-0.00020, 0.00020),
    s: rand(0.6, 1.7),
    a: rand(0, Math.PI * 2),
    va: rand(-0.006, 0.006)
  }));

  const embersN = Math.max(120, Math.min(220, Math.floor((w * h) / 9000)));
  const embers = Array.from({ length: embersN }, () => makeEmber());

  function makeEmber(){
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      r: 0.8 + Math.random() * 2.2,
      vy: 0.25 + Math.random() * 1.1,
      vx: -0.35 + Math.random() * 0.7,
      a: 0.10 + Math.random() * 0.35,
      flicker: 0.6 + Math.random() * 1.8
    };
  }

  const mouse = { x: 0.5, y: 0.5, active: false };
  window.addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", ()=> mouse.active = false);

  const eyes = [
    { x: 0.18, y: 0.28, s: 1.0 },
    { x: 0.82, y: 0.68, s: 1.15 }
  ];

  let t = 0;

  function fx(){
    const fxOn = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fxOn")) || 1;

    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#05060a");
    bg.addColorStop(0.55, "#070814");
    bg.addColorStop(1, "#03030a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.08 + 0.06 * fxOn;
    for (let i = 0; i < 6; i++) {
      const x = (Math.sin(t * 0.28 + i) * 0.5 + 0.5) * w;
      const y = (Math.cos(t * 0.22 + i * 1.7) * 0.5 + 0.5) * h;
      const rad = Math.min(w, h) * (0.26 + i * 0.05);
      const haze = ctx.createRadialGradient(x, y, 0, x, y, rad);
      haze.addColorStop(0, `rgba(160,0,0,${0.25 * fxOn})`);
      haze.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = haze;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    const pulse = (Math.sin(t * 1.25) + 1) / 2;
    for (const e of eyes) {
      const ex = e.x * w;
      const ey = e.y * h;
      const base = Math.min(w, h) * 0.09 * e.s;
      const ring = base * (0.85 + pulse * 0.35);

      const ringG = ctx.createRadialGradient(ex, ey, ring * 0.18, ex, ey, ring);
      ringG.addColorStop(0, "rgba(255,40,40,0)");
      ringG.addColorStop(0.6, `rgba(255,35,35,${(0.05 + pulse * 0.10) * fxOn})`);
      ringG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ringG;
      ctx.beginPath();
      ctx.arc(ex, ey, ring, 0, Math.PI * 2);
      ctx.fill();

      const core = ctx.createRadialGradient(ex, ey, 0, ex, ey, ring * 0.18);
      core.addColorStop(0, `rgba(255,60,60,${(0.08 + pulse * 0.14) * fxOn})`);
      core.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(ex, ey, ring * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < embers.length; i++) {
      const p = embers[i];
      p.x += p.vx;
      p.y -= p.vy;
      if (p.y < -30 || p.x < -30 || p.x > w + 30) {
        embers[i] = makeEmber();
        embers[i].y = h + 20;
      }
      const flick = (Math.sin(t * 6 * p.flicker + i) + 1) / 2;
      const alpha = (p.a * (0.65 + flick * 0.7)) * fxOn;
      const r = p.r * (0.8 + flick * 0.7);

      const emberG = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r * 6);
      emberG.addColorStop(0, `rgba(255,60,60,${alpha})`);
      emberG.addColorStop(0.5, `rgba(200,20,20,${alpha * 0.35})`);
      emberG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = emberG;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r * 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.save();
    for(const p of shards){
      p.x += p.vx; p.y += p.vy; p.a += p.va;
      if(mouse.active){
        p.x += (mouse.x - p.x) * 0.00005;
        p.y += (mouse.y - p.y) * 0.00005;
      }
      if(p.x < -0.05) p.x = 1.05;
      if(p.x > 1.05) p.x = -0.05;
      if(p.y < -0.05) p.y = 1.05;
      if(p.y > 1.05) p.y = -0.05;

      const px = p.x * w;
      const py = p.y * h;
      const size = 18 * p.s * DPR;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(p.a);

      ctx.beginPath();
      ctx.moveTo(-size * 0.9, -size * 0.25);
      ctx.lineTo(size, 0);
      ctx.lineTo(-size * 0.8, size * 0.35);
      ctx.closePath();

      const grad = ctx.createLinearGradient(-size, 0, size, 0);
      grad.addColorStop(0, `rgba(255,42,63,${(0.02 + 0.08 * fxOn)})`);
      grad.addColorStop(0.55, `rgba(255,20,60,${(0.05 + 0.18 * fxOn)})`);
      grad.addColorStop(1, `rgba(176,0,28,${(0.03 + 0.12 * fxOn)})`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.strokeStyle = `rgba(255,255,255,${(0.02 + 0.05 * fxOn)})`;
      ctx.lineWidth = 1 * DPR;
      ctx.stroke();

      ctx.restore();
    }
    ctx.restore();
  }

  function step(){
    t += 0.016;
    fx();
    requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function init(){
  setLinks();
  setYear();
  bindCopy();
  bindSmoothScroll();
  bindFxToggle();
  bindContactForm();
  initBackground();
  fetchRepos();
  renderInstagramEmbeds();
  bindEmbedRefresh();
  let tries = 0;
  const t = setInterval(()=>{
    tries++;
    refreshInstagramEmbeds();
    if((window.instgrm && window.instgrm.Embeds) || tries > 12) clearInterval(t);
  }, 700);
}

init();

const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");

if(menuBtn && navLinks){
  menuBtn.addEventListener("click", ()=>{
    navLinks.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", navLinks.classList.contains("open"));
  });
}

