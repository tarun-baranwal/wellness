// Apply dark mode if saved in localStorage
window.onload = function () {
  if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    updateToggleIcon("dark");
  } else {
    updateToggleIcon("light");
  }
};

// Toggle function (only works if button exists)
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
    updateToggleIcon("dark");
  } else {
    localStorage.setItem("darkMode", "disabled");
    updateToggleIcon("light");
  }
}

// Change toggle button icon (safe check)
function updateToggleIcon(mode) {
  const btn = document.querySelector(".dark-toggle");
  if (!btn) return; // skip if button doesn't exist
  btn.textContent = mode === "dark" ? "🌞" : "🌙";
}