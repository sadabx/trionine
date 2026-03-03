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

        // --- projects render (optimized for GitHub API rate limits) ---
        async function renderProjects() {
          const grid = document.getElementById("projects-grid");
          if (!grid) return;

          // 1. Manual Website Cards
          const websites = [
            {
              title: "ManifestHub",
              desc: "Track game downloads, manage Discord assets.",
              lang: "JavaScript",
              img: "https://i.postimg.cc/QtfXkJMk/Screenshot_2026_03_02_013220.png",
              link: "https://manifesthub.trionine.xyz",
              updated: "3 days ago",
            },
            {
              title: "Mermaid Resort",
              desc: "Responsive landing page for a coastal resort.",
              lang: "CSS",
              img: "https://i.postimg.cc/JnLydxmf/Screenshot_2026_03_02_012944.png",
              link: "https://mermaidresort.netlify.app",
              updated: "12 days ago",
            },
          ];

          let html = "";

          websites.forEach((site) => {
            const langClass =
              site.lang === "JavaScript"
                ? "lang-js"
                : site.lang === "CSS"
                ? "lang-css"
                : "";
            html += `
      <div class="project-card fade-in appear">
        <div class="card-image"><img src="${site.img}" alt="${site.title}"/></div>
        <div class="card-content">
          <h3><a href="${site.link}" target="_blank">${site.title}</a></h3>
          <p>${site.desc}</p>
          <div class="tags">
            <span class="tag ${langClass}"><span class="lang-dot"></span> ${site.lang}</span>
            <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${site.updated}</span>
          </div>
          <div class="project-links">
            <a href="${site.link}" class="btn btn-outline" target="_blank"><i class="fas fa-external-link-alt"></i> Visit</a>
          </div>
        </div>
      </div>`;
          });

          // 2. Fetch all public repositories in ONE call
          try {
            const response = await fetch(
              "https://api.github.com/users/sadabx/repos?sort=updated&per_page=100"
            );
            if (!response.ok) throw new Error("API limit reached or error");

            const allRepos = await response.json();

            // Filter for specific projects you want to show
            const projectNames = ["esp32-tools", "lncrawler"];
            const filteredRepos = allRepos.filter((repo) =>
              projectNames.includes(repo.name)
            );

            filteredRepos.forEach((repo) => {
              let langClass = "";
              if (repo.language === "JavaScript") langClass = "lang-js";
              else if (repo.language === "C++") langClass = "lang-cpp";

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
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>${
              repo.description ||
              "A custom development project hosted on GitHub."
            }</p>
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
          } catch (error) {
            console.warn(
              "GitHub API rate limit likely reached. Using fallback data.",
              error
            );
            // You can add static fallback cards here if the API fails
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