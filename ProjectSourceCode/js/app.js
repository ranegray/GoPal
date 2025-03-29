import { passwordErrorText } from "./password_error.js";
import { getLocation } from "./geolocation.js";

//Turns active nav bar button blue
const navBar = document.getElementById("nav-bar");
if (navBar) {
  document.addEventListener("DOMContentLoaded", function () {
    const currentPath = window.location.pathname;
    const activeLink = document.querySelector(
      `.sidebar-nav-button[href="${currentPath}"]`
    );

    if (activeLink) {
      activeLink.classList.remove("bg-white", "hover:bg-gray-300");
      activeLink.classList.add("bg-blue-300", "hover:bg-blue-400");
    }
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

document.addEventListener("DOMContentLoaded", function () {
  // Activity Modal - Adding Activity
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

  // Notification Dropdown
  const notificationIcon = document.getElementById("notification-icon");
  const notificationDropdown = document.getElementById("notification-dropdown");

  notificationIcon.addEventListener("click", function (event) {
    event.stopPropagation(); // Prevent the click from being detected by the document
    notificationDropdown.classList.toggle("hidden");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    // Check if dropdown is visible and the click is outside the dropdown and icon
    if (!notificationDropdown.classList.contains("hidden") && 
        !notificationDropdown.contains(event.target) && 
        event.target !== notificationIcon) {
      notificationDropdown.classList.add("hidden");
    }
  });
});
