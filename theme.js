document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('icon-toggle');
  if (!toggle) return;

  // 1. Load saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    toggle.checked = true;
  } else if (savedTheme === 'light') {
    toggle.checked = false;
  }

  // 2. Add event listener to save choice on change
  toggle.addEventListener('change', () => {
    if (toggle.checked) {
      localStorage.setItem('theme', 'dark');
    } else {
      localStorage.setItem('theme', 'light');
    }
  });
});
