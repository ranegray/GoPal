// This is the JS file that handles requesting user location from the browser.

/**
 * Time interval - 
 * For the sake of reducing API calls while still updating location intermittently, a time interval has been set.
 * This interval is set to 5 minutes.
 */

let lastUpdateTime = 0;
const updateInterval = 5 * 60 * 1000; // 5 minutes

// Requesting user location:
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error);
    } else {
        alert("Geolocation is not supported by your browser.");
    }
}

function success(position) {
    const currentTime = Date.now();

    if (currentTime - lastUpdateTime < updateInterval) {
        return; 
    }

    lastUpdateTime = currentTime; 

    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    document.getElementById("latitude").value = latitude;
    document.getElementById("longitude").value = longitude;
    retrieveWeather(latitude, longitude); 
}

function error() {
    alert("We were unable to retrieve your location. Please check browser settings and try again.");
}

// Weather Endpoint - calls the backend endpoint for weather data.
function retrieveWeather(lat, lon) {
    const backendUrl = "/api/weather"; 

    fetch(backendUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat: lat, lon: lon })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error("Error fetching weather data:", data.error);
            return;
        }
        // Air Quality data rendering
        document.getElementById("air-quality").innerHTML = data.airQuality;

        //Weather data rendering
        data = data.weather;
        document.getElementById("temperature").innerHTML = data.main.temp + " °F"; // Temperature
        document.getElementById("humidity").innerHTML = data.main.humidity + " %"; // Humidity
        document.getElementById("wind").innerHTML = data.wind.speed; // Wind Speed
        document.getElementById("weather").innerHTML = data.weather[0].description; // Weather Description
        document.getElementById("weatherIcon").src = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png"; // Weather Icon
        document.getElementById("city").innerHTML = data.name; // City Name
    })
    .catch(error => {
        console.error("Error fetching weather data:", error);
    });
}

// Start tracking user location
getLocation();