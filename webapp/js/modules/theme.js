// Theme management module
export function initTheme() {
    const isDarkMode =
        localStorage.theme === "dark" ||
        (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);

    // Apply the initial theme
    document.documentElement.classList.toggle("dark", isDarkMode);

    // Set up theme toggle button listener
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
        });
    }
}
