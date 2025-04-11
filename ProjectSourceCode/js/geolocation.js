// Checks if the API has already attempted to get weather data or if the data is already present.
function isWeatherDataPresentOrAttempted() {
    const await_message = document.getElementById('await-message');
    const urlParams = new URLSearchParams(window.location.search);
    if (!await_message || urlParams.has('weatherAttempted')) {
      return true;
    }
    return false;
}

function success(position) {

    // Extracting latitude and longitude from the position object:
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Redirecting to the Express server endpoint:
    window.location.href = `/weatherAPI?lat=${latitude}&lon=${longitude}`;
}

function error() {
    alert("Unable to detect location. Please check your browser settings and retry.");
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if the weather data is already present or if an attempt has been made, if not, call the weather API.
    if (!isWeatherDataPresentOrAttempted()) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(success, error);
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    }
});