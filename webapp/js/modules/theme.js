// Theme management module
export function initTheme() {
    const isDarkMode =
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Apply the initial theme
    document.documentElement.classList.toggle("dark", isDarkMode);

    // Add theme toggle button to header
    const header = document.querySelector("header");
    const themeToggle = document.createElement("button");
    themeToggle.className =
        "absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors";
    themeToggle.innerHTML = `
    <span class="sr-only">Toggle theme</span>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 block dark:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <svg class="w-6 h-6 text-gray-800 dark:text-gray-200 hidden dark:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  `;

    themeToggle.addEventListener("click", () => {
        document.documentElement.classList.toggle("dark");
        localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    });

    header.style.position = "relative";
    header.appendChild(themeToggle);
} 