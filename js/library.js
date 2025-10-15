// Wait for the Supabase library to load properly
  console.log('🔧 Waiting for Supabase library to load...');
  
  let supabase;
  let supabaseInitialized = false;

  function initializeSupabase() {
    try {
      // Check if supabase is available globally
      if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        console.log('✅ Supabase library found globally');
        const supabaseUrl = 'https://jylyupfpoxakhmztmckx.supabase.co';
        const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHl1cGZwb3hha2htenRtY2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM5NjYsImV4cCI6MjA3NjA1OTk2Nn0.j4OWfwJUltZd1H0-RAhSrhzXKwhK2fMkdMex0aaby44';
        
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        supabaseInitialized = true;
        console.log('✅ Supabase client created successfully');
        return true;
      } else {
        console.error('❌ Supabase library not available');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to create Supabase client:', error);
      return false;
    }
  }

  // Load resources from Supabase
  async function loadResources() {
    console.log('🔍 Starting to load resources from Supabase...');
    
    if (!supabaseInitialized || !supabase) {
      console.error('❌ Supabase client not initialized');
      showError('Database connection not available. Please refresh the page.');
      return;
    }
    
    try {
      const { data: resources, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Supabase Error:', error);
        showError('Error loading resources: ' + error.message);
        return;
      }

      console.log('✅ Success! Resources loaded:', resources);
      console.log('📊 Number of resources:', resources.length);
      
      if (resources.length === 0) {
        console.log('ℹ️ No resources found in database');
        showMessage('No resources found. Add some resources using the form below!');
      } else {
        displayResources(resources);
      }
      
    } catch (err) {
      console.error('❌ Unexpected error in loadResources:', err);
      showError('Unexpected error: ' + err.message);
    }
  }

  // Helper function to show errors
  function showError(message) {
    const resourcesList = document.getElementById('resourcesList');
    if (resourcesList) {
      resourcesList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #ef4444;">
          <h3>Error</h3>
          <p>${message}</p>
          <p>Check browser console for details</p>
        </div>
      `;
    }
  }

  // Helper function to show messages
  function showMessage(message) {
    const resourcesList = document.getElementById('resourcesList');
    if (resourcesList) {
      resourcesList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: #9ca3af;">
          <h3>No Resources</h3>
          <p>${message}</p>
        </div>
      `;
    }
  }

  // Display resources in the grid
  function displayResources(resources) {
    console.log('🎨 Displaying resources in grid...');
    const resourcesList = document.getElementById('resourcesList');
    if (!resourcesList) {
      console.error('❌ Resources list element not found');
      return;
    }
    
    resourcesList.innerHTML = '';

    resources.forEach((resource, index) => {
      console.log(`📚 Resource ${index + 1}:`, resource.title);
      const resourceCard = createResourceCard(resource);
      resourcesList.appendChild(resourceCard);
    });
    
    console.log('✅ All resources displayed');
  }

  // Create resource card HTML
  function createResourceCard(resource) {
    const card = document.createElement('div');
    card.className = 'resource-card';
    card.dataset.level = resource.level;
    
    const formattedDate = new Date(resource.shared_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    card.innerHTML = `
      <div class="resource-cover" style="background-image: url('${resource.cover_image_url || 'https://via.placeholder.com/300x180?text=No+Cover'}');">
        <div class="resource-level">${getLevelDisplayName(resource.level)}</div>
      </div>
      <div class="resource-content">
        <h3 class="resource-title">
          <a href="${resource.download_url}" target="_blank">${resource.title}</a>
        </h3>
        <div class="resource-author">Author: ${resource.author}</div>
        <div class="resource-meta">
          <div class="resource-rating">⭐ ${resource.rating || 'N/A'}</div>
          <a href="${resource.download_url}" class="download-btn" target="_blank">
            <i class="fas fa-download"></i> Download
          </a>
        </div>
        <div class="resource-shared">Shared by: ${resource.shared_by || 'Anonymous'} | ${formattedDate}</div>
      </div>
    `;

    return card;
  }

  // Helper function to get display name for levels
  function getLevelDisplayName(level) {
    const levelMap = {
      'ssc': 'SSC Level',
      'intermediate': 'Intermediate Level',
      'admission': 'University Admission',
      'university': 'University Level',
      'other': 'Others'
    };
    return levelMap[level] || level;
  }

  // Test Supabase connection
  async function testSupabaseConnection() {
    console.log('🔌 Testing Supabase connection...');
    
    if (!supabaseInitialized || !supabase) {
      console.error('❌ Supabase client not available for connection test');
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('count');
      
      if (error) {
        console.error('❌ Supabase connection failed:', error);
        return false;
      } else {
        console.log('✅ Supabase connection successful!');
        return true;
      }
    } catch (err) {
      console.error('❌ Connection test error:', err);
      return false;
    }
  }

  // Setup form handler
  function setupFormHandler() {
    const form = document.getElementById('resourceForm');
    if (!form) {
      console.error('❌ Form element not found');
      return;
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!supabaseInitialized || !supabase) {
        alert('Database connection not available. Please refresh the page.');
        return;
      }
      
      const resourceData = {
        title: document.getElementById('book-title').value,
        author: document.getElementById('author').value,
        level: document.getElementById('educational-level').value,
        subject: document.getElementById('subject').value,
        description: document.getElementById('description').value,
        cover_image_url: document.getElementById('cover-image').value,
        download_url: '#',
        shared_by: 'Anonymous User'
      };

      console.log('📤 Submitting resource:', resourceData);

      const { data, error } = await supabase
        .from('resources')
        .insert([resourceData]);

      if (error) {
        console.error('❌ Form submission error:', error);
        alert('Error submitting resource: ' + error.message);
      } else {
        console.log('✅ Resource submitted successfully!');
        alert('Thank you for contributing to our open source library! Your resource will be reviewed and added soon.');
        form.reset();
        loadResources();
      }
    });
    
    console.log('✅ Form handler setup complete');
  }

  // Setup search functionality
  function setupSearch() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    
    if (!searchButton || !searchInput) {
      console.error('❌ Search elements not found');
      return;
    }
    
    searchButton.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    console.log('✅ Search functionality setup complete');
  }

  // Search functionality
  function performSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
      console.error('❌ Search input not found');
      return;
    }
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    const resourceCards = document.querySelectorAll('.resource-card');
    
    console.log('🔍 Performing search for:', searchTerm);
    
    if (searchTerm !== '') {
      resourceCards.forEach(card => {
        const title = card.querySelector('.resource-title').textContent.toLowerCase();
        const author = card.querySelector('.resource-author').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || author.includes(searchTerm)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    } else {
      resourceCards.forEach(card => {
        card.style.display = 'block';
      });
    }
  }

  // Setup filter functionality
  function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    if (filterButtons.length === 0) {
      console.error('❌ Filter buttons not found');
      return;
    }
    
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        const filterValue = button.dataset.filter;
        const resourceCards = document.querySelectorAll('.resource-card');
        
        resourceCards.forEach(card => {
          if (filterValue === 'all') {
            card.style.display = 'block';
          } else {
            if (card.dataset.level === filterValue) {
              card.style.display = 'block';
            } else {
              card.style.display = 'none';
            }
          }
        });
      });
    });
    
    console.log('✅ Filter functionality setup complete');
  }

  // Setup navbar scroll effect
  function setupNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) {
      console.error('❌ Navbar not found');
      return;
    }
    
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    
    console.log('✅ Navbar setup complete');
  }

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Page loaded, initializing...');
    
    // First, try to initialize Supabase
    const supabaseReady = initializeSupabase();
    
    if (!supabaseReady) {
      console.error('❌ Supabase initialization failed');
      showError('Failed to initialize database connection. The Supabase library may not have loaded properly.');
      
      // Set up UI functionality anyway (filters, search, etc.)
      setupNavbar();
      setupFilters();
      setupSearch();
      setupFormHandler();
      showMessage('Database connection unavailable. Some features may not work.');
      return;
    }
    
    // Setup all functionality
    setupNavbar();
    setupFilters();
    setupSearch();
    setupFormHandler();
    
    // Test connection and load resources
    const connected = await testSupabaseConnection();
    if (connected) {
      await loadResources();
    } else {
      showError('Unable to connect to the database. Please check your Supabase configuration.');
    }
    
    console.log('✅ All initialization complete');
  });
