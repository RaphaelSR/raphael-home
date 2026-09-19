try {
  const theme = localStorage.getItem("home-theme");
  if (theme === "light" || theme === "dark") {
    document.documentElement.dataset.theme = theme;
  }
} catch {
  // The stylesheet still follows the system theme when storage is blocked.
}
