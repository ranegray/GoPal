/**
 * This file handles gathering user location from the browser.
 * This has to be done on the client side, because we can only use the HTML5 geolocation API in the browser.
 * So, our process will look something like this:
 * 1. The user is prompted for location access.
 * 2. This file gathers user location in the form of coordinates.
 * 3. Those coordinates are sent to our server-side endpoint.
 */

// Initialize lastUpdateTime from localStorage (or default to 0 if not set)
let lastUpdateTime = parseInt(localStorage.getItem('lastUpdateTime')) || 0;
const updateInterval = 5 * 60 * 1000; // 5 minutes in milliseconds

function success(position) {
    const currentTime = Date.now();

    if (currentTime - lastUpdateTime < updateInterval) {
        return;
    }

    lastUpdateTime = currentTime;
    localStorage.setItem('lastUpdateTime', currentTime);

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Redirecting to the Express server endpoint:
    window.location.href = `/weatherAPI?lat=${latitude}&lon=${longitude}`;
}

function error() {
    alert("Unable to detect location. Please check your browser settings and retry.");
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
} else {
    alert("Geolocation is not supported by your browser.");
}

// Using JS's setInterval to lower API calls. It's set to 5 minutes.
setInterval(function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error);
    } 
}, updateInterval);
