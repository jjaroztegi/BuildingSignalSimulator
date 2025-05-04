// Dark mode theme initialization and toggle
export function initTheme() {
  const isDarkMode =
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Set initial theme based on preference or system setting
  document.documentElement.classList.toggle('dark', isDarkMode);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.documentElement.classList.toggle('dark');
      localStorage.theme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
  }
}
