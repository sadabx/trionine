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
    { id: "home", link: document.getElementById("link-home") },
    { id: "about", link: document.getElementById("link-about") },
    { id: "projects", link: document.getElementById("link-projects") },
    { id: "contact", link: document.getElementById("link-contact") },
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
      window.scrollY + window.innerHeight >=
      document.documentElement.scrollHeight - 8;
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
    { threshold: 0.15 },
  );

  function observeFadeIns(root) {
    root
      .querySelectorAll(".fade-in:not(.appear)")
      .forEach((el) => fadeObserver.observe(el));
  }

  // observe static page elements immediately
  observeFadeIns(document);

  // --- Project Rendering — returns a Promise so the preloader can wait for it
  async function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    //fallback colors
    const fallbackColors = {
      JavaScript: "#f1e05a",
      HTML: "#e34c26",
      CSS: "#563d7c",
      Python: "#3572A5",
      "C++": "#f34b7d",
    };

    let langColors = {};

    function getLangColor(lang) {
      if (!lang) return "#858585";
      return langColors[lang]?.color || fallbackColors[lang] || "#858585";
    }

    function timeAgo(dateStr) {
      const diff = Math.floor(
        Math.abs(new Date() - new Date(dateStr)) / (1000 * 60 * 60 * 24),
      );
      return diff === 0
        ? "today"
        : diff === 1
          ? "yesterday"
          : `${diff} days ago`;
    }

    let html = "";

    async function getGithubToken() {
      try {
        const res = await fetch(".env");
        if (res.ok) {
          const text = await res.text();
          const match = text.match(/GITHUB_TOKEN\s*=\s*[\r\n\s]*(github_pat_[a-zA-Z0-9_]+)/);
          if (match && match[1]) return match[1];
        }
      } catch (e) {
        // Safe fallback if local fetch is blocked by CORS (e.g. file:// scheme)
      }
      return typeof window.GITHUB_TOKEN !== "undefined" ? window.GITHUB_TOKEN : "";
    }

    const GITHUB_TOKEN = await getGithubToken();

    try {
      const colorsRes = await fetch("https://raw.githubusercontent.com/ozh/github-colors/master/colors.json");
      if (colorsRes.ok) {
        langColors = await colorsRes.json();
      }
    } catch (e) {
      console.warn("Failed to fetch dynamic language colors:", e);
    }

    const coreWebsites = [
      // Add future private projects here, e.g.:
      // {
      //   repoPath: "sadabx/private-repo",
      //   img: "assets/private-demo.png",
      //   link: "https://private.trionine.com",
      // }
    ];

    // 1. Private / core websites (authenticated)
    for (const site of coreWebsites) {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${site.repoPath}`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          },
        );
        if (!res.ok) throw new Error(`Could not fetch ${site.repoPath}`);
        const repo = await res.json();
        const title = site.customName || repo.name.replace(/-/g, " ");
        const imgHtml = site.img
          ? `<div class="card-image"><img src="${site.img}" alt="${title}" loading="lazy"/></div>`
          : "";
        html += `
          <div class="project-card fade-in">
            ${imgHtml}
            <div class="card-content">
              <h3><a href="${site.link}" target="_blank">${title}</a></h3>
              <p>${repo.description || "No description provided."}</p>
              <div class="tags">
                ${repo.language ? `<span class="tag"><span class="lang-dot" style="background-color: ${getLangColor(repo.language)}"></span> ${repo.language}</span>` : ""}
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
        "https://api.github.com/users/sadabx/repos?sort=updated&per_page=100",
      );
      if (!res.ok) throw new Error("API limit reached");
      const allRepos = await res.json();

      const projectNames = [
        "ManifestHub",
        "mermaid-resort",
        "archive",
        "iptv",
        "f1",
        "fifa",
        "f1-bot",
        "Resort-react",
        "TNTV"
      ];
      const repoImages = {
        ManifestHub: "assets/ss/manifesthub.png",
        "mermaid-resort": "assets/ss/mermaidresort.png",
        //need to quote this key bcz it contains '-', in js '-' is used for subtraction
        archive: "assets/ss/archive.png",
        f1: "assets/ss/f1dashboard.png",
        iptv: "assets/ss/iptv.png",
        fifa: "assets/ss/fifa.png",
      };
      const repoCustomNames = {
        "mermaid-resort": "Mermaid Beach Resort",
      };
      const repoHomepages = {
        ManifestHub: "https://manifesthub.trionine.com",
        "mermaid-resort": "https://mermaid.trionine.com",
      };

      const filteredRepos = projectNames
        .map((name) => allRepos.find((r) => r.name === name))
        .filter(Boolean);

      filteredRepos.forEach((repo) => {
        const img = repoImages[repo.name];
        const title = repoCustomNames[repo.name] || repo.name.replace(/-/g, " ");
        const homepage = repoHomepages[repo.name] || repo.homepage;

        const imgHtml = img
          ? `<div class="card-image"><img src="${img}" alt="${title}" loading="lazy"/></div>`
          : "";

        html += `
          <div class="project-card fade-in">
            ${imgHtml}
            <div class="card-content">
              <h3><a href="${homepage || repo.html_url}" target="_blank">${title}</a></h3>
              <p>${repo.description || "Hosted on GitHub."}</p>
              <div class="tags">
                ${repo.language ? `<span class="tag"><span class="lang-dot" style="background-color: ${getLangColor(repo.language)}"></span> ${repo.language}</span>` : ""}
                <span class="tag"><i class="fa fa-star"></i> ${repo.stargazers_count}</span>
                <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${timeAgo(repo.pushed_at || repo.updated_at)}</span>
              </div>
              <div class="project-links">
                <a href="${repo.html_url}" class="btn btn-outline" target="_blank"><i class="fab fa-github"></i> Code</a>
                ${homepage ? `<a href="${homepage}" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Visit</a>` : ""}
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
    preloader.addEventListener(
      "transitionend",
      () => {
        preloader.style.display = "none";
      },
      { once: true },
    );
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
