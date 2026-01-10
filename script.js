const CONFIG = {
  name: "Sly",

  instagramUrl: "https://www.instagram.com/sly.jpeg/",
  twitterUrl: "https://x.com/redwristsly",
  githubUrl: "https://github.com/slyycoding",
  githubUser: "slyycoding",

  // CHANGE THESE:
  email: "you@example.com",
  discord: "yourdiscord",

  repoLimit: 9,

  // Paste Instagram post / reel links here to show embeds in the Design section:
  instaPosts: [
    // "https://www.instagram.com/p/POSTCODE/",
    // "https://www.instagram.com/reel/REELCODE/"
  ]
};

const $ = (q) => document.querySelector(q);

function setLinks(){
  $("#linkInsta").href = CONFIG.instagramUrl;
  $("#linkTwitter").href = CONFIG.twitterUrl;
  $("#linkGithub").href = CONFIG.githubUrl;

  $("#workInstaBtn").href = CONFIG.instagramUrl;

  $("#emailText").textContent = CONFIG.email;
  $("#discordText").textContent = CONFIG.discord;

  document.title = `${CONFIG.name} | Tokyo Ghoul Portfolio`;
}

function setYear(){ $("#year").textContent = new Date().getFullYear(); }

function toast(msg){
  const el = $("#copyToast");
  el.textContent = msg;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(()=>{ el.textContent=""; }, 1800);
}

async function copyToClipboard(text){
  try{ await navigator.clipboard.writeText(text); return true; }
  catch{ return false; }
}

function bindCopy(){
  $("#copyEmailBtn").addEventListener("click", async ()=>{
    toast((await copyToClipboard(CONFIG.email)) ? "Email copied ✓" : "Copy failed");
  });
  $("#copyDiscordBtn").addEventListener("click", async ()=>{
    toast((await copyToClipboard(CONFIG.discord)) ? "Discord copied ✓" : "Copy failed");
  });
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
  $("#contactForm").addEventListener("submit", (e)=>{
    e.preventDefault();
    const data = new FormData(e.target);
    const name = (data.get("name") || "Someone").toString().trim();
    const message = (data.get("message") || "").toString().trim();

    const subject = encodeURIComponent(`Website contact from ${name}`);
    const body = encodeURIComponent(message);

    window.location.href = `mailto:${CONFIG.email}?subject=${subject}&body=${body}`;
  });
}

/* Instagram embeds */
function renderInstagramEmbeds(){
  const grid = $("#instaGrid");
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
  $("#refreshEmbedsBtn").addEventListener("click", ()=>{
    refreshInstagramEmbeds();
    toast("Embeds refreshed ✓");
  });
}

/* GitHub */
async function fetchRepos(){
  const status = $("#statusText");
  try{
    status.textContent = "Fetching GitHub…";
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

    status.textContent = "GitHub loaded ✓";
    $("#githubNote").textContent = "";

    initRepoUI(list);
    updateStats(list);
  }catch(e){
    status.textContent = "GitHub unavailable";
    $("#githubNote").textContent = "GitHub API can rate-limit — refresh later if it fails.";
    $("#repoList").innerHTML = `<div class="card">Could not load repos. ${escapeHtml(String(e.message))}</div>`;
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

  $("#repoCount").textContent = shown.length;
  $("#starCount").textContent = stars;
  $("#langCount").textContent = topLangs.length ? topLangs.join(", ") : "—";
}

function renderRepos(list){
  const wrap = $("#repoList");
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

/* Background crimson shards */
function initBackground(){
  const canvas = $("#bg");
  const ctx = canvas.getContext("2d");
  let w, h, dpr;

  const rand = (min, max) => Math.random() * (max - min) + min;

  const resize = () => {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    w = canvas.width = Math.floor(window.innerWidth * dpr);
    h = canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
  };

  const count = Math.max(48, Math.min(120, Math.floor((window.innerWidth * window.innerHeight) / 16000)));
  const shards = Array.from({ length: count }, () => ({
    x: rand(0,1), y: rand(0,1),
    vx: rand(-0.00025, 0.00025),
    vy: rand(-0.00018, 0.00018),
    s: rand(0.6, 1.6),
    a: rand(0, Math.PI * 2),
    va: rand(-0.005, 0.005)
  }));

  const mouse = { x: 0.5, y: 0.5, active: false };
  window.addEventListener("mousemove", (e)=>{
    mouse.x = e.clientX / window.innerWidth;
    mouse.y = e.clientY / window.innerHeight;
    mouse.active = true;
  });
  window.addEventListener("mouseleave", ()=> mouse.active = false);

  function drawShard(p){
    const px = p.x * w;
    const py = p.y * h;
    const size = 18 * p.s * dpr;
    const fxOn = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--fxOn")) || 1;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(p.a);

    ctx.beginPath();
    ctx.moveTo(-size * 0.9, -size * 0.25);
    ctx.lineTo(size, 0);
    ctx.lineTo(-size * 0.8, size * 0.35);
    ctx.closePath();

    const grad = ctx.createLinearGradient(-size, 0, size, 0);
    grad.addColorStop(0, `rgba(255,42,63,${0.02 + 0.08 * fxOn})`);
    grad.addColorStop(0.55, `rgba(255,20,60,${0.05 + 0.18 * fxOn})`);
    grad.addColorStop(1, `rgba(176,0,28,${0.03 + 0.12 * fxOn})`);

    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = `rgba(255,255,255,${0.03 + 0.04 * fxOn})`;
    ctx.lineWidth = 1 * dpr;
    ctx.stroke();

    ctx.restore();
  }

  function step(){
    ctx.clearRect(0,0,w,h);

    const g = ctx.createRadialGradient(w*0.25, h*0.2, 0, w*0.25, h*0.2, w*0.9);
    g.addColorStop(0, "rgba(255,42,63,0.12)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

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

      drawShard(p);
    }

    requestAnimationFrame(step);
  }

  resize();
  window.addEventListener("resize", resize);
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

  // process embeds when IG script is ready
  let tries = 0;
  const t = setInterval(()=>{
    tries++;
    refreshInstagramEmbeds();
    if((window.instgrm && window.instgrm.Embeds) || tries > 12) clearInterval(t);
  }, 700);
}

init();
