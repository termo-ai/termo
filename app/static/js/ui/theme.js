// app/static/js/ui/theme.js

let isDarkTheme = true;

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    
    // Toggle body classes
    document.body.classList.toggle('bg-white');
    document.body.classList.toggle('text-black');
    document.body.classList.toggle('bg-gray-900');
    document.body.classList.toggle('text-white');
    
    // Toggle other theme-specific elements
    // Note: Additional theme-specific toggles can be added here
    // as the application's theming needs grow
    
    // Save theme preference
    localStorage.setItem('theme', isDarkTheme ? 'dark' : 'light');
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        toggleTheme();
    }
});