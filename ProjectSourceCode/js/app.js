//Turns Active Button Blue
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    const activeLink = document.querySelector(`.sidebar-nav-button[href="${currentPath}"]`);
    
    if (activeLink) {
        activeLink.classList.remove('bg-white', 'hover:bg-gray-300');
        activeLink.classList.add('bg-blue-300', 'hover:bg-blue-400');
    }
});

