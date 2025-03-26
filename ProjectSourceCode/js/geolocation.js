// This is the JS file that handles requesting user location from the browser.

/**
 * Time interval - 
 * For the sake of reducing API calls while still updating location intermittently, a time interval has been set.
 * This interval is set to 5 minutes.
 */

let lastUpdateTime = 0;
const updateInterval = 5 * 60 * 1000; // 5 minutes

// Requesting user location:
export function getLocation() {
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

    const weatherApiKey = "dcbe75ab0b9efeaae04251ca4f1c3bf8";

    retrieveWeather(latitude, longitude, weatherApiKey); 
    retrieveAirQuality(latitude, longitude, weatherApiKey);
}

function error() {
    alert("We were unable to retrieve your location. Please check browser settings and try again.");
}

const weatherApiKey = "dcbe75ab0b9efeaae04251ca4f1c3bf8";

// Weather Endpoint
function retrieveWeather(lat, lon, weatherApiKey) {
    const weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?lat=" + lat + "&lon=" + lon + "&appid=" + weatherApiKey + "&units=imperial";

    fetch(weatherApiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        document.getElementById("temperature").innerHTML = data.main.temp + " °F"; // Temperature
        document.getElementById("humidity").innerHTML = data.main.humidity + " %"; // Humidity
        document.getElementById("wind").innerHTML = data.wind.speed; // Wind Speed
        document.getElementById("weather").innerHTML = data.weather[0].description; // Weather Description
        document.getElementById("weatherIcon").src = "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png"; // Weather Icon
        document.getElementById("city").innerHTML = data.name; // City Name

        // Alerts
        /**
         * For alerts:
         * The OpenWeatherMap API does not provide alerts directly in the weather endpoint.
         * Instead, we can make custom alerts for conditions users may find troublesome. 
         * Users should be able to set their own alerts based on temperature, humidity, wind speed, etc.
         * -> Will have to figure out with team how we want to connect this with the database and user accounts, 
         * so for now it is on hold.
         */
    })
    .catch(error => {
        console.error("Error fetching weather data:", error);
    });
}

// Pollution Endpoint
function retrieveAirQuality(lat, lon, weatherApiKey) {
    const pollutionApiUrl = "https://api.openweathermap.org/data/2.5/air_pollution?lat=" + lat + "&lon=" + lon + "&appid=" + weatherApiKey;
    
    fetch(pollutionApiUrl)
    .then(response => response.json())
    .then(data => {
        console.log(data);
        console.log(data.list[0].main.aqi); 
        document.getElementById("air-quality").innerHTML = data.list[0].main.aqi; 
    })
    .catch(error => {
        console.error("Error fetching pollution data:", error);
    });
}
