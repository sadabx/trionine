(function () {
  // --- year
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- navbar scroll effect
  const navbar = document.getElementById("navbar");
  const backBtn = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 30) {
      navbar?.classList.add("scrolled");
    } else {
      navbar?.classList.remove("scrolled");
    }
    if (window.scrollY > 300) {
      backBtn?.classList.add("visible");
    } else {
      backBtn?.classList.remove("visible");
    }
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
    const scrollPos = window.scrollY + 100; // offset
    let current = null;
    for (let s of sections) {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= scrollPos) {
        current = s.link;
      } else {
        break;
      }
    }
    sections.forEach((s) => {
      if (s.link) s.link.classList.remove("active-sidebar");
    });
    if (current) current.classList.add("active-sidebar");
    else sections[0]?.link?.classList.add("active-sidebar"); // default home
  }

  window.addEventListener("scroll", updateSidebar);
  window.addEventListener("load", updateSidebar);

  // Project Rendering
  async function renderProjects() {
    const grid = document.getElementById("projects-grid");
    if (!grid) return;

    //  Read-Only PAT Token
    const GITHUB_TOKEN =
      "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";

    // images + links
    const coreWebsites = [
      {
        repoPath: "sadabx/ManifestHub",
        img: "https://i.postimg.cc/QtfXkJMk/Screenshot_2026_03_02_013220.png",
        link: "https://manifesthub.trionine.xyz",
      },
      {
        repoPath: "sadabx/mermaid-resort",
        customName: "Mermaid Beach Resort",
        img: "https://i.postimg.cc/15TJY28t/Screenshot_2026_03_04_183707.png",
        link: "https://mermaid.trionine.xyz",
      },
    ];

    let html = "";

    // Fetch the private/core websites individually using the token
    for (const site of coreWebsites) {
      try {
        const response = await fetch(
          `https://api.github.com/repos/${site.repoPath}`,
          {
            headers: {
              Authorization: `Bearer ${GITHUB_TOKEN}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) throw new Error(`Could not fetch ${site.repoPath}`);
        const repo = await response.json();

        // Calculate time ago
        const updatedDate = new Date(repo.pushed_at || repo.updated_at);
        const diffDays = Math.floor(
          Math.abs(new Date() - updatedDate) / (1000 * 60 * 60 * 24)
        );
        const updatedText =
          diffDays === 0
            ? "today"
            : diffDays === 1
            ? "yesterday"
            : `${diffDays} days ago`;

        // Map languages to colors
        let langClass =
          repo.language === "JavaScript"
            ? "lang-js"
            : repo.language === "CSS"
            ? "lang-css"
            : "";

        // Determine which title to show
        const displayTitle = site.customName || repo.name.replace(/-/g, " ");

        html += `
                <div class="project-card fade-in appear">
                 <div class="card-image"><img src="${
                   site.img
                 }" alt="${displayTitle}"/></div>
                  <div class="card-content">
                      <h3><a href="${
                        site.link
                      }" target="_blank">${displayTitle}</a></h3>
                    <p>${repo.description || "No description provided."}</p>
                    <div class="tags">
                      ${
                        repo.language
                          ? `<span class="tag ${langClass}"><span class="lang-dot"></span> ${repo.language}</span>`
                          : ""
                      }
                      <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${updatedText}</span>
                    </div>
                    <div class="project-links">
                      <a href="${
                        site.link
                      }" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Visit</a>
                    </div>
                  </div>
                </div>`;
      } catch (e) {
        console.warn(e.message);
      }
    }

    // 2. Fetch Public Repos (Without the token)
    try {
      const response = await fetch(
        "https://api.github.com/users/sadabx/repos?sort=updated&per_page=100"
      );
      if (!response.ok) throw new Error("API Limit");

      const allRepos = await response.json();

      // Select the public repos you want to feature
      const projectNames = ["esp32-tools", "lncrawler"];
      const filteredRepos = allRepos.filter((repo) =>
        projectNames.includes(repo.name)
      );

      filteredRepos.forEach((repo) => {
        let langClass =
          repo.language === "JavaScript"
            ? "lang-js"
            : repo.language === "C++"
            ? "lang-cpp"
            : "";

        const updatedDate = new Date(repo.pushed_at || repo.updated_at);
        const diffDays = Math.floor(
          Math.abs(new Date() - updatedDate) / (1000 * 60 * 60 * 24)
        );
        const updatedText =
          diffDays === 0
            ? "today"
            : diffDays === 1
            ? "yesterday"
            : `${diffDays} days ago`;

        html += `
                <div class="project-card fade-in appear">
                  <div class="card-content">
                    <h3><a href="${
                      repo.html_url
                    }" target="_blank">${repo.name.replace(/-/g, " ")}</a></h3>
                    <p>${repo.description || "Hosted on GitHub."}</p>
                    <div class="tags">
                      ${
                        repo.language
                          ? `<span class="tag ${langClass}"><span class="lang-dot"></span> ${repo.language}</span>`
                          : ""
                      }
                      <span class="tag"><i class="fa fa-star"></i> ${
                        repo.stargazers_count
                      }</span>
                      <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${updatedText}</span>
                    </div>
                    <div class="project-links">
                      <a href="${
                        repo.html_url
                      }" class="btn btn-outline" target="_blank"><i class="fab fa-github"></i> Code</a>
                      ${
                        repo.homepage
                          ? `<a href="${repo.homepage}" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Demo</a>`
                          : ""
                      }
                    </div>
                  </div>
                </div>`;
      });
    } catch (e) {
      console.warn("Public fetch failed", e);
    }

    grid.innerHTML = html;
  }

  renderProjects();

  // --- contact form
  const form = document.getElementById("contact-form");
  const statusDiv = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      statusDiv.innerText = "Sending...";
      statusDiv.style.color = "var(--fg-muted)";
      try {
        const response = await fetch(form.action, {
          method: "POST",
          body: data,
          headers: { Accept: "application/json" },
        });
        if (response.ok) {
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

  // fade observer
  const faders = document.querySelectorAll(".fade-in");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("appear");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  faders.forEach((el) => observer.observe(el));
})();
