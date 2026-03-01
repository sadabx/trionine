// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();

  // Initialize all components
  initNavbarScroll();
  initMobileMenu();
  initSidebarHighlight();
  initContactForm();
  initFadeAnimations();
  
  // Load projects (websites + GitHub repos)
  renderProjects();
});

// ===== NAVBAR SCROLL EFFECT =====
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  const backBtn = document.getElementById('backToTop');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    
    if (window.scrollY > 300) {
      backBtn?.classList.add('visible');
    } else {
      backBtn?.classList.remove('visible');
    }
  });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  
  if (!hamburger || !navLinks) return;
  
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  // Close menu when clicking a link
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// ===== SIDEBAR ACTIVE STATE =====
function initSidebarHighlight() {
  const sections = [
    { id: 'home', link: document.getElementById('link-home') },
    { id: 'about', link: document.getElementById('link-about') },
    { id: 'projects', link: document.getElementById('link-projects') },
    { id: 'contact', link: document.getElementById('link-contact') }
  ];
  
  function updateSidebar() {
    const scrollPos = window.scrollY + 100;
    let current = null;
    
    for (let s of sections) {
      const el = document.getElementById(s.id);
      if (el && el.offsetTop <= scrollPos) {
        current = s.link;
      } else {
        break;
      }
    }
    
    sections.forEach(s => {
      if (s.link) s.link.classList.remove('active-sidebar');
    });
    
    if (current) {
      current.classList.add('active-sidebar');
    } else {
      sections[0]?.link?.classList.add('active-sidebar');
    }
  }
  
  window.addEventListener('scroll', updateSidebar);
  window.addEventListener('load', updateSidebar);
}

// ===== PROJECTS (Static Websites + GitHub API) =====
async function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;
  
  // Show loading state
  grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--fg-muted);">Loading repositories...</div>';
  
  // Static website projects
  const websites = [
    {
      title: 'ManifestHub',
      desc: 'Track game downloads, manage Discord assets.',
      lang: 'JavaScript',
      img: 'https://i.postimg.cc/QtfXkJMk/Screenshot_2026_03_02_013220.png',
      link: 'https://manifesthub.trionine.xyz',
      updated: '3 days ago'
    },
    {
      title: 'Mermaid Resort',
      desc: 'Responsive landing page for a coastal resort.',
      lang: 'CSS',
      img: 'https://i.postimg.cc/JnLydxmf/Screenshot_2026_03_02_012944.png',
      link: 'https://mermaidresort.netlify.app',
      updated: '12 days ago'
    }
  ];
  
  // Language color mapping
  const langColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Python: '#3572A5',
    Java: '#b07219',
    C: '#555555',
    'C++': '#f34b7d',
    PHP: '#4F5D95',
    Ruby: '#701516',
    Go: '#00ADD8',
    Rust: '#dea584',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Vue: '#41b883',
    Shell: '#89e051'
  };
  
  try {
    // Fetch from GitHub API
    const response = await fetch('https://api.github.com/users/sadabx/repos?sort=updated&per_page=100');
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const repos = await response.json();
    
    // Filter: public, non-fork, sort by updated_at
    const publicRepos = repos
      .filter(repo => !repo.fork && repo.visibility === 'public')
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    
    // Helper: format date to "X days ago"
    function timeAgo(dateString) {
      const updated = new Date(dateString);
      const now = new Date();
      const diffMs = now - updated;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    }
    
    // Build HTML
    let html = '';
    
    // Add website cards
    websites.forEach(site => {
      const langColor = langColors[site.lang] || '#8b949e';
      html += `
        <div class="project-card">
          <div class="card-image"><img src="${site.img}" alt="${site.title}"/></div>
          <div class="card-content">
            <h3><a href="${site.link}" target="_blank">${site.title}</a></h3>
            <p>${site.desc}</p>
            <div class="tags">
              <span class="tag"><span class="lang-dot" style="background-color: ${langColor};"></span> ${site.lang}</span>
              <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${site.updated}</span>
            </div>
            <div class="project-links">
              <a href="${site.link}" class="btn btn-outline"><i class="fa fa-external-link"></i> Visit</a>
            </div>
          </div>
        </div>
      `;
    });
    
    // Add GitHub repository cards
    publicRepos.forEach(repo => {
      const lang = repo.language || 'Unknown';
      const langColor = langColors[lang] || '#8b949e';
      const updatedText = timeAgo(repo.updated_at);
      const description = repo.description || 'No description provided.';
      
      html += `
        <div class="project-card">
          <div class="card-content">
            <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
            <p>${description}</p>
            <div class="tags">
              <span class="tag"><span class="lang-dot" style="background-color: ${langColor};"></span> ${lang}</span>
              <span class="tag"><i class="fa fa-star"></i> ${repo.stargazers_count}</span>
              <span class="updated-row"><i class="fa-regular fa-clock"></i> Updated ${updatedText}</span>
            </div>
            <div class="project-links">
              <a href="${repo.html_url}" class="btn btn-outline"><i class="fab fa-github"></i> Code</a>
              ${repo.homepage ? `<a href="${repo.homepage}" class="btn btn-outline"><i class="fa fa-external-link"></i> Demo</a>` : ''}
            </div>
          </div>
        </div>
      `;
    });
    
    grid.innerHTML = html;
    
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    grid.innerHTML = `
      <div style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--accent-red); border:1px solid var(--border-primary); border-radius:var(--radius-lg);">
        <i class="fa fa-exclamation-triangle"></i> Failed to load repositories. 
        <button onclick="renderProjects()" class="btn btn-outline" style="margin-left:1rem; padding:0.2rem 1rem;">Retry</button>
      </div>
    `;
  }
}

// ===== CONTACT FORM =====
function initContactForm() {
  const form = document.getElementById('contact-form');
  const statusDiv = document.getElementById('form-status');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    
    statusDiv.innerText = 'Sending...';
    statusDiv.style.color = 'var(--fg-muted)';
    
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      
      if (response.ok) {
        statusDiv.innerText = 'Message sent successfully!';
        statusDiv.style.color = 'var(--accent-green)';
        form.reset();
      } else {
        statusDiv.innerText = 'Error sending message.';
        statusDiv.style.color = 'var(--accent-red)';
      }
    } catch (error) {
      statusDiv.innerText = 'Network error.';
      statusDiv.style.color = 'var(--accent-red)';
    }
  });
}

// ===== FADE-IN ANIMATIONS =====
function initFadeAnimations() {
  const faders = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('appear');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  
  faders.forEach(el => observer.observe(el));
}