const CONFIG = {
  name: "Sly",
  instagramUrl: "https://www.instagram.com/sly.jpeg/",
  twitterUrl: "https://x.com/redwristsly",
  githubUrl: "https://github.com/slyycoding",
  githubUser: "slyycoding",
  email: "you@example.com",
  discord: "yourdiscord",
  repoLimit: 9,
  instaPosts: []
};

const $ = (q) => document.querySelector(q);

function setLinks(){
  const a = $("#linkInsta"); if(a) a.href = CONFIG.instagramUrl;
  const b = $("#linkTwitter"); if(b) b.href = CONFIG.twitterUrl;
  const c = $("#linkGithub"); if(c) c.href = CONFIG.githubUrl;

  const d = $("#workInstaBtn"); if(d) d.href = CONFIG.instagramUrl;

  const e = $("#emailText"); if(e) e.textContent = CONFIG.email;
  const f = $("#discordText"); if(f) f.textContent = CONFIG.discord;

  document.title = `${CONFIG.name} | Tokyo Ghoul Portfolio`;
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
    canvas.heig
