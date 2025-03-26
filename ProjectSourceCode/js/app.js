import { passwordErrorText } from './password_error.js';
import { getLocation } from './geolocation.js';

//Turns active nav bar button blue
const navBar = document.getElementById('nav-bar');
if(navBar){
    document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;
        const activeLink = document.querySelector(`.sidebar-nav-button[href="${currentPath}"]`);
        
        if (activeLink) {
            activeLink.classList.remove('bg-white', 'hover:bg-gray-300');
            activeLink.classList.add('bg-blue-300', 'hover:bg-blue-400');
        }
    });
}

// Register Page
if (window.location.pathname === '/register'){
    //Password error text setup
    passwordErrorText()
}

// Home page
// TODO: Make changes to geolocation.js so that the weather API key is not exposed to the frontend and the repo
if (window.location.pathname === '/home'){
    getLocation()
}
