import { passwordErrorText } from "./password_error.js";
import { getLocation } from "./geolocation.js";

//Turns active nav bar buttons blue
document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.getElementById("nav-bar");
  if (navBar) {
    const currentPath = window.location.pathname;
    const mainPage = "/" + currentPath.split("/")[1];
    const mainActiveLink = document.querySelector(
      `.sidebar-nav-button[href="${mainPage}"]`
    );
    if (mainActiveLink) {
      mainActiveLink.classList.remove("bg-white", "hover:bg-gray-300");
      mainActiveLink.classList.add("bg-blue-300", "hover:bg-blue-400");
    }
  }
});

//Turns active sub nav bar buttons blue
document.addEventListener("DOMContentLoaded", function () {
  const subNavBar = document.getElementById("sub-nav-bar");
  if (subNavBar) {
    const currentPath = window.location.pathname;
    const subActiveLink = document.querySelector(
      `.sub-nav-button[href="${currentPath}"]`
    );
    if (subActiveLink) {
      subActiveLink.classList.remove("bg-white", "hover:bg-gray-300");
      subActiveLink.classList.add("bg-blue-300", "hover:bg-blue-400");
    }
  }
});

if (window.location.pathname === "/settings/profile") {
  document.addEventListener("DOMContentLoaded", function () {
    const fileInput = document.getElementById("profilePicture");
    const errorMessage = document.getElementById("error-message");

    if (!fileInput || !errorMessage) return; // Ensure elements exist

    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes

      if (file && file.size > maxSize) {
        errorMessage.textContent = "File size exceeds 2MB limit.";
        errorMessage.classList.toggle("hidden", false);
        this.value = ""; // Clear the file input
      } else {
        errorMessage.textContent = "";
        errorMessage.classList.toggle("hidden", true);
      }
    });
  });
}

// Register Page
if (window.location.pathname === "/register") {
  //Password error text setup
  passwordErrorText();
}

// Home page
// TODO: Make changes to geolocation.js so that the weather API key is not exposed to the frontend and the repo
if (window.location.pathname === "/home") {
  getLocation();
}

// Account tab of settings page
if (window.location.pathname === "/settings/account") {
  // fetches a list of countries from the rest countries API and uses it to create the dropdown select menu
  //TODO: maybe store this data somewhere as a backup so that if the API goes down or something, the country dropdown won't break, it will just use the last available data
  fetch("https://restcountries.com/v3.1/all")
    .then((response) => response.json())
    .then((data) => {
      const select = document.getElementById("countrySelect");
      const countries = data.map((country) => country.name.common).sort();
      countries.forEach((country) => {
        const option = document.createElement("option");
        option.value = country;
        option.textContent = country;
        select.appendChild(option);
      });
    })
    .catch((error) => console.error("Error fetching countries:", error));
    
    // Set the max attribute of birthday to today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("birthday").setAttribute("max", today);
}
// Activity Modal
// This code handles the modal for adding activities
document.addEventListener("DOMContentLoaded", function () {
  // Get DOM elements
  const activityModal = document.getElementById("activity-modal");
  const activityForm = document.getElementById("activity-form");
  const closeModalButton = document.getElementById("close-modal-button");
  const cancelButton = document.getElementById("cancel-button");
  const addActivityButton = document.getElementById("add-activity-button");

  // Set today as the default date
  const dateInput = document.getElementById("activity-date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // Set current time as default
  const timeInput = document.getElementById("activity-time");
  if (timeInput) {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();

    // Format hours and minutes to HH:MM
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    timeInput.value = `${hours}:${minutes}`;
  }

  // Open modal when "Add Activity" button is clicked
  if (addActivityButton) {
    addActivityButton.addEventListener("click", function () {
      activityModal.classList.remove("hidden");
      activityModal.classList.add("flex");
    });
  }

  // Close modal functions
  function closeModal() {
    activityModal.classList.add("hidden");
    activityModal.classList.remove("flex");
    activityForm.reset();
  }

  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeModal);
  }

  if (cancelButton) {
    cancelButton.addEventListener("click", closeModal);
  }
});
