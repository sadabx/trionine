      // Supabase configuration
      const SUPABASE_URL = "https://jylyupfpoxakhmztmckx.supabase.co";
      const SUPABASE_ANON_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp5bHl1cGZwb3hha2htenRtY2t4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0ODM5NjYsImV4cCI6MjA3NjA1OTk2Nn0.j4OWfwJUltZd1H0-RAhSrhzXKwhK2fMkdMex0aaby44";

      // Initialize Supabase
      const supabase = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      );

      // Utility functions
      function getInitials(name) {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase();
      }

      // Check authentication state
      async function checkAuth() {
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          const authButtons = document.getElementById("authButtons");

          if (session && authButtons) {
            showUserMenu(session.user);
          }
        } catch (error) {
          console.error("Auth check error:", error);
        }
      }

      // Show user menu with dropdown
      function showUserMenu(user) {
        const authButtons = document.getElementById("authButtons");
        const userName = user.user_metadata?.full_name || "User";

        if (authButtons) {
          authButtons.innerHTML = `
          <div class="user-menu">
            <div class="user-avatar" title="${user.email}" id="userAvatar">
              <i class="fas fa-user"></i>
            </div>
            <div class="dropdown-menu" id="dropdownMenu">
              <div class="dropdown-header">
                <div class="user-name">${userName}</div>
                <div class="user-email">${user.email}</div>
              </div>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item" onclick="logout()">
                <i class="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>
        `;

          // Add event listener for the avatar
          document
            .getElementById("userAvatar")
            .addEventListener("click", toggleDropdown);

          // Close dropdown when clicking outside
          document.addEventListener("click", closeDropdown);
        }
      }

      function toggleDropdown(e) {
        e.stopPropagation();
        const dropdown = document.getElementById("dropdownMenu");
        dropdown.classList.toggle("active");
      }

      function closeDropdown(e) {
        const dropdown = document.getElementById("dropdownMenu");
        const avatar = document.getElementById("userAvatar");

        if (
          dropdown &&
          !dropdown.contains(e.target) &&
          !avatar.contains(e.target)
        ) {
          dropdown.classList.remove("active");
        }
      }

      // Logout function
      async function logout() {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.error("Logout error:", error);
          }
          window.location.href = "auth.html";
        } catch (error) {
          console.error("Logout error:", error);
        }
      }

      // Initialize when page loads
      document.addEventListener("DOMContentLoaded", function () {
        checkAuth();
      });
