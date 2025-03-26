import { passwordErrorText } from './password_error.js';
import { getLocation } from './geolocation.js';

//Turns active nav bar buttons blue
const navBar = document.getElementById('nav-bar');
if(navBar){
    // mainActiveLink is for the main nav bar, subActiveLink is for any tabs within each main page (like different settings tabs)
    document.addEventListener('DOMContentLoaded', function() {
        const currentPath = window.location.pathname;
        const mainPage = '/' + currentPath.split('/')[1];
        const mainActiveLink = document.querySelector(`.sidebar-nav-button[href="${mainPage}"]`);
        const subActiveLink = document.querySelector(`.sub-nav-button[href="${currentPath}"]`);
        console.log(subActiveLink);
        if (mainActiveLink) {
            mainActiveLink.classList.remove('bg-white', 'hover:bg-gray-300');
            mainActiveLink.classList.add('bg-blue-300', 'hover:bg-blue-400');
        }
        if (subActiveLink) {
            subActiveLink.classList.remove('bg-white', 'hover:bg-gray-300');
            subActiveLink.classList.add('bg-blue-300', 'hover:bg-blue-400');
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
