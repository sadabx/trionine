(function () {
  // --- year
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- navbar scroll effect
  const navbar = document.getElementById("navbar");
  const backBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 30);
    backBtn?.classList.toggle("visible", window.scrollY > 300);
  });

  // --- mobile menu
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  if (hamburger) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      hamburger.classList.toggle("active");
    });
    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        hamburger.classList.remove("active");
      });
    });
  }

  // --- dynamic sidebar active (based on scroll)
  const sections = [
    { id: "home",     link: document.getElementById("link-home")     },
    { id: "about",    link: document.getElementById("link-about")    },
    { id: "projects", link: document.getElementById("link-projects") },
    { id: "contact",  link: document.getElementById("link-contact")  },
  ];

  function updateSidebar() {
    const marker = window.innerHeight * 0.35;
    let current = sections[0]?.link || null;
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top <= marker && rect.bottom > marker) current = section.link;
    }
    const nearBottom =
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
    if (nearBottom) current = sections[sections.length - 1]?.link || current;
    sections.forEach((s) => s.link?.classList.remove("active-sidebar"));
    if (current) current.classList.add("active-sidebar");
    else sections[0]?.link?.classList.add("active-sidebar");
  }

  window.addEventListener("scroll", updateSidebar);
  window.addEventListener("load", updateSidebar);

  // --- fade observer — defined early so renderProjects can reuse it
  // FIX #3: moved up and extracted into a reusable function
  const fadeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("appear");
          fadeObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  function observeFadeIns(root) {
    root.querySelectorAll(".fade-in:not(.appear)").forEach((el) =>
      fadeObserver.observe(el)
    );
  }

  // observe static page elements immediately
  observeFadeIns(document);

  // --- Project Rendering — returns a Promise so the preloader can wait for it
  async function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    // ⚠️ SECURITY: PAT is visible in client-side JS.
    // For production, move this fetch to a backend proxy or GitHub App.
    const GITHUB_TOKEN =
      "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";

    const coreWebsites = [
      {
        repoPath: "sadabx/ManifestHub",
        img: "assets/manifesthub.png",
        link: "https://manifesthub.trionine.xyz",
      },
      {
        repoPath: "sadabx/mermaid-resort",
        customName: "Mermaid Beach Resort",
        img: "assets/mermaidresort.png",
        link: "https://mermaid.trionine.xyz",
      },
    ];

    function getLangClass(lang) {
      return (
        { JavaScript: "lang-js", CSS: "lang-css", HTML: "lang-html",
          Python: "lang-py", "C++": "lang-cpp" }[lang] || ""
      );
    }

    function timeAgo(dateStr) {
      const diff = Math.floor(
        Math.abs(new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24)
      );
      return diff === 0 ? "today" : diff === 1 ? "yesterday" : `${diff} days ago`;
    }

    let html = "";

    // 1. Private / core websites (authenticated)
    for (const site of coreWebsites) {
      try {
        const res = await fetch(`https://api.github.com/repos/${site.repoPath}`, {
          headers: {
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        });
        if (!res.ok) throw new Error(`Could not fetch ${site.repoPath}`);
        const repo = await res.json();
        const title = site.customName || repo.name.replace(/-/g, " ");
        const lc = getLangClass(repo.language);
        html += `
          <div class="project-card fade-in">
            <div class="card-image"><img src="${site.img}" alt="${title}" loading="lazy"/></div>
            <div class="card-content">
              <h3><a href="${site.link}" target="_blank">${title}</a></h3>
              <p>${repo.description || "No description provided."}</p>
              <div class="tags">
                ${repo.language ? `<span class="tag ${lc}"><span class="lang-dot"></span> ${repo.language}</span>` : ""}
                <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${timeAgo(repo.pushed_at || repo.updated_at)}</span>
              </div>
              <div class="project-links">
                <a href="${site.link}" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Visit</a>
              </div>
            </div>
          </div>`;
      } catch (e) {
        console.warn(e.message);
      }
    }

    // 2. Public repos
    try {
      const res = await fetch(
        "https://api.github.com/users/sadabx/repos?sort=updated&per_page=100"
      );
      if (!res.ok) throw new Error("API limit reached");
      const allRepos = await res.json();

      // FIX #4: preserve intentional display order from projectNames array
      const projectNames = ["archive", "f1"];
      const repoImages = {
        archive: "assets/archive.png",
        f1: "assets/f1dashboard.png",
      };

      const filteredRepos = projectNames
        .map((name) => allRepos.find((r) => r.name === name))
        .filter(Boolean);

      filteredRepos.forEach((repo) => {
        const lc = getLangClass(repo.language);
        // FIX #7: safe fallback if repoImages entry is missing
        const img = repoImages[repo.name] || "assets/placeholder.png";
        const title = repo.name.replace(/-/g, " ");
        html += `
          <div class="project-card fade-in">
            <div class="card-image"><img src="${img}" alt="${title}" loading="lazy"/></div>
            <div class="card-content">
              <h3><a href="${repo.html_url}" target="_blank">${title}</a></h3>
              <p>${repo.description || "Hosted on GitHub."}</p>
              <div class="tags">
                ${repo.language ? `<span class="tag ${lc}"><span class="lang-dot"></span> ${repo.language}</span>` : ""}
                <span class="tag"><i class="fa fa-star"></i> ${repo.stargazers_count}</span>
                <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${timeAgo(repo.pushed_at || repo.updated_at)}</span>
              </div>
              <div class="project-links">
                <a href="${repo.html_url}" class="btn btn-outline" target="_blank"><i class="fab fa-github"></i> Code</a>
                ${repo.homepage ? `<a href="${repo.homepage}" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Visit</a>` : ""}
              </div>
            </div>
          </div>`;
      });
    } catch (e) {
      console.warn("Public fetch failed:", e);
    }

    grid.innerHTML = html;
    // FIX #3: observe newly injected cards so they fade in on scroll
    observeFadeIns(grid);
  }

  // --- hide preloader after projects are fetched (even if API fails)
  function hidePreloader() {
    const preloader = document.getElementById("preloader");
    if (!preloader) return;
    preloader.classList.add("preloader-hidden");
    preloader.addEventListener("transitionend", () => {
      preloader.style.display = "none";
    }, { once: true });
  }

  // FIX #1: .finally() ensures preloader always hides even if renderProjects rejects
  const projectsReady = renderProjects();
  if (document.readyState === "complete") {
    projectsReady.finally(hidePreloader);
  } else {
    window.addEventListener("load", () => projectsReady.finally(hidePreloader));
  }

  // --- contact form
  const form = document.getElementById("contact-form");
  const statusDiv = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      statusDiv.innerText = "Sending...";
      statusDiv.style.color = "var(--fg-muted)";
      try {
        const res = await fetch(form.action, {
          method: "POST",
          body: new FormData(form),
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          statusDiv.innerText = "Message sent successfully!";
          statusDiv.style.color = "var(--accent-green)";
          form.reset();
        } else {
          statusDiv.innerText = "Error sending message.";
          statusDiv.style.color = "var(--accent-red)";
        }
      } catch {
        statusDiv.innerText = "Network error.";
        statusDiv.style.color = "var(--accent-red)";
      }
    });
  }
})();
