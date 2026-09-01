const GITHUB_CONFIG = {
  owner: "YOUR_GITHUB_USERNAME",   // e.g. "taniyavishwakarma"
  repo: "YOUR_REPO_NAME",          // e.g. "portfolio"
  branch: "main",
  path: "data.json"
};

// Set this by generating a SHA-256 hash of your chosen admin password (see instructions below).
const ADMIN_PASSWORD_HASH = "REPLACE_WITH_YOUR_HASH";

let siteData = null;

async function loadData() {
  const res = await fetch("data.json?_=" + Date.now());
  siteData = await res.json();
  renderAll();
}

function renderAll() {
  renderHero();
  renderAbout();
  renderExperience();
  renderProjects();
  renderSkills();
  renderCerts();
  renderEducation();
  renderAdminProjectList();
}

// ---------- Logo helper (no dead Clearbit dependency) ----------
function colorFromString(str) {
  const palette = ["#2dd4bf","#818cf8","#f472b6","#fb923c","#facc15","#60a5fa","#a78bfa","#34d399"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}
function initials(name) {
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(w => w[0].toUpperCase()).join("");
}
function logoBadgeHTML(company, logoUrl) {
  if (logoUrl) {
    return `<div class="logo-badge"><img src="${logoUrl}" alt="${company} logo" onerror="this.parentElement.outerHTML=fallbackBadge('${company.replace(/'/g,"")}')" /></div>`;
  }
  return fallbackBadge(company);
}
function fallbackBadge(company) {
  return `<div class="logo-badge" style="background:${colorFromString(company)}">${initials(company)}</div>`;
}
window.fallbackBadge = fallbackBadge; // used in inline onerror

// ---------- Renderers ----------
function renderHero() {
  const p = siteData.profile;
  document.getElementById("avatarImg").src = p.avatar || "[placehold.co](https://placehold.co/400x400/0f172a/2dd4bf?text=TV)";
  document.getElementById("heroName").textContent = p.name;
  document.getElementById("heroTitle").textContent = p.title;
  document.getElementById("heroSummary").textContent = p.tagline;
  document.getElementById("heroLinks").innerHTML = `
    <a href="tel:${p.phone}">${p.phone}</a>
    <a href="mailto:${p.email}">${p.email}</a>
    <a href="${p.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
    <a href="${p.website}" target="_blank" rel="noopener">Website</a>`;
}

function renderAbout() {
  document.getElementById("aboutText").textContent = siteData.profile.summary;
}

function renderExperience() {
  const el = document.getElementById("experienceTimeline");
  el.innerHTML = siteData.employment.map(job => `
    <div class="timeline-item">
      ${logoBadgeHTML(job.company, job.logo)}
      <div class="ti-body">
        <h4>${job.role} — ${job.company}</h4>
        <div class="ti-duration">${job.duration}</div>
        ${job.tech ? `<div class="ti-tech">${job.tech.map(t => `<span class="tag">${t}</span>`).join("")}</div>` : ""}
        ${job.points ? `<ul class="ti-points">${job.points.map(pt => `<li>${pt}</li>`).join("")}</ul>` : ""}
      </div>
    </div>`).join("");
}

function renderProjects() {
  const el = document.getElementById("projectsGrid");
  el.innerHTML = siteData.projects.map(pr => `
    <div class="project-card">
      <div class="project-head">
        ${logoBadgeHTML(pr.company, pr.logo)}
        <div>
          <h4>${pr.company}</h4>
          <div class="project-category">${pr.category || ""}</div>
        </div>
      </div>
      <p class="project-desc">${pr.description}</p>
      <div class="ti-tech">${(pr.tech || []).map(t => `<span class="tag">${t}</span>`).join("")}</div>
    </div>`).join("");
}

function renderSkills() {
  const el = document.getElementById("skillsGrid");
  el.innerHTML = Object.entries(siteData.skills).map(([group, items]) => `
    <div class="skill-group">
      <h4>${group}</h4>
      <div class="skill-tags">${items.map(i => `<span class="tag">${i}</span>`).join("")}</div>
    </div>`).join("");
}

function renderCerts() {
  document.getElementById("certsList").innerHTML = siteData.certifications.map(c => `<li>${c}</li>`).join("");
  document.getElementById("achievementsList").innerHTML = siteData.achievements.map(a => `<li>${a}</li>`).join("");
}

function renderEducation() {
  document.getElementById("educationTimeline").innerHTML = siteData.education.map(e => `
    <div class="timeline-item">
      ${fallbackBadge(e.school)}
      <div class="ti-body">
        <h4>${e.degree} — ${e.school}</h4>
        <div class="ti-duration">${e.duration} · ${e.score}</div>
      </div>
    </div>`).join("");
}

// ---------- Nav toggle ----------
document.getElementById("navToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Booking widget ----------
function populateTimeSlots() {
  const select = document.getElementById("bookTime");
  select.innerHTML = "";
  for (let h = 9; h <= 18; h++) {
    for (let m of [0, 30]) {
      if (h === 18 && m === 30) continue;
      const label = `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
      select.innerHTML += `<option value="${label}">${label}</option>`;
    }
  }
}
populateTimeSlots();
document.getElementById("bookDate").min = new Date().toISOString().split("T")[0];

document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("bookName").value;
  const email = document.getElementById("bookEmail").value;
  const date = document.getElementById("bookDate").value;
  const time = document.getElementById("bookTime").value;
  const message = document.getElementById("bookMessage").value;

  const subject = encodeURIComponent(`Meeting Request from ${name} — ${date} ${time} IST`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nRequested date: ${date}\nRequested time: ${time} IST\n\nMessage:\n${message}`
  );
  window.location.href = `mailto:${siteData.profile.email}?subject=${subject}&body=${body}`;
  document.getElementById("bookingStatus").textContent = "Opening your email client to send the request…";
});

// ---------- Admin: login ----------
async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}
function showModal(id) { document.getElementById(id).classList.remove("hidden"); }
function hideModal(id) { document.getElementById(id).classList.add("hidden"); }

document.querySelectorAll("[data-close]").forEach(btn =>
  btn.addEventListener("click", () => hideModal(btn.dataset.close))
);
document.getElementById("adminOpenBtn").addEventListener("click", () => showModal("loginModal"));

document.getElementById("adminLoginBtn").addEventListener("click", async () => {
  const pw = document.getElementById("adminPassword").value;
  const hash = await sha256(pw);
  if (hash === ADMIN_PASSWORD_HASH) {
    hideModal("loginModal");
    showModal("adminModal");
    document.getElementById("loginError").textContent = "";
  } else {
    document.getElementById("loginError").textContent = "Incorrect password.";
  }
});

document.getElementById("adminLogoutBtn").addEventListener("click", () => {
  sessionStorage.removeItem("gh_token");
  hideModal("adminModal");
});

// ---------- Admin: add / remove project ----------
function renderAdminProjectList() {
  const el = document.getElementById("adminProjectList");
  el.innerHTML = siteData.projects.map((p, i) => `
    <li>${p.company} <button data-idx="${i}" class="remove-proj">Remove</button></li>`).join("");
  el.querySelectorAll(".remove-proj").forEach(btn =>
    btn.addEventListener("click", () => {
      siteData.projects.splice(Number(btn.dataset.idx), 1);
      renderProjects();
      renderAdminProjectList();
    })
  );
}

document.getElementById("apAddBtn").addEventListener("click", () => {
  const company = document.getElementById("apCompany").value.trim();
  const domain = document.getElementById("apDomain").value.trim();
  const category = document.getElementById("apCategory").value.trim();
  const tech = document.getElementById("apTech").value.split(",").map(t => t.trim()).filter(Boolean);
  const description = document.getElementById("apDescription").value.trim();
  if (!company || !description) {
    document.getElementById("adminStatus").textContent = "Company and description are required.";
    return;
  }
  siteData.projects.push({ company, domain, category, tech, description });
  renderProjects();
  renderAdminProjectList();
  ["apCompany","apDomain","apCategory","apTech","apDescription"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("adminStatus").textContent = "Added to preview. Click 'Publish to GitHub' to make it permanent.";
});

// ---------- Admin: publish to GitHub ----------
document.getElementById("apPublishBtn").addEventListener("click", async () => {
  const status = document.getElementById("adminStatus");
  let token = sessionStorage.getItem("gh_token");
  if (!token) {
    token = prompt("Enter your GitHub Personal Access Token (kept only in this browser session, never saved):");
    if (!token) return;
    sessionStorage.setItem("gh_token", token);
  }
  status.textContent = "Publishing…";
  try {
    const apiBase = `[api.github.com](https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${GITHUB_CONFIG.path})`;
    const getRes = await fetch(`${apiBase}?ref=${GITHUB_CONFIG.branch}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" }
    });
    if (!getRes.ok) throw new Error(`Could not read current file (${getRes.status}). Check token/repo config.`);
    const currentFile = await getRes.json();

    const newContent = btoa(unescape(encodeURIComponent(JSON.stringify(siteData, null, 2))));
    const putRes = await fetch(apiBase, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Update portfolio data — ${new Date().toISOString()}`,
        content: newContent,
        sha: currentFile.sha,
        branch: GITHUB_CONFIG.branch
      })
    });
    if (!putRes.ok) throw new Error(`Publish failed (${putRes.status}). Check token permissions.`);
    status.textContent = "Published! Your GitHub Pages site will update in a minute or two.";
  } catch (err) {
    status.textContent = err.message;
  }
});

document.getElementById("apExportBtn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(siteData, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.json";
  a.click();
});

loadData();
