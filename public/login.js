// Login page functionality
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.getElementById("passwordToggle");
  const loadingOverlay = document.getElementById("loadingOverlay");
  const errorMessage = document.getElementById("errorMessage");
  const errorText = document.getElementById("errorText");

  // Password visibility toggle
  passwordToggle.addEventListener("click", function () {
    const type =
      passwordInput.getAttribute("type") === "password" ? "text" : "password";
    passwordInput.setAttribute("type", type);

    const icon = passwordToggle.querySelector("i");
    icon.className = type === "password" ? "fas fa-eye" : "fas fa-eye-slash";
  });

  // Handle form submission
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showError("Please fill in all fields");
      return;
    }

    // Show loading overlay
    loadingOverlay.style.display = "flex";
    hideError();

    try {
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to admin panel
        window.location.href = "/admin";
      } else {
        showError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Network error. Please check your connection and try again.");
    } finally {
      // Hide loading overlay
      loadingOverlay.style.display = "none";
    }
  });

  // Show error message
  function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = "flex";

    // Auto-hide error after 5 seconds
    setTimeout(() => {
      hideError();
    }, 5000);
  }

  // Hide error message
  function hideError() {
    errorMessage.style.display = "none";
  }

  // Clear error when user starts typing
  usernameInput.addEventListener("input", hideError);
  passwordInput.addEventListener("input", hideError);

  // Enter key to submit form
  document.addEventListener("keydown", function (e) {
    if (
      e.key === "Enter" &&
      (document.activeElement === usernameInput ||
        document.activeElement === passwordInput)
    ) {
      loginForm.dispatchEvent(new Event("submit"));
    }
  });

  // Focus on username field on page load
  usernameInput.focus();
});
