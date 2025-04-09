import { passwordErrorText } from "./password_error.js";
import { getLocation } from "./geolocation.js";

//Turns active nav bar buttons blue
document.addEventListener("DOMContentLoaded", function () {
  const navBar = document.getElementById("nav-bar");
  if (navBar) {
    const currentPath = window.location.pathname;
    const mainPage = "/" + currentPath.split("/")[1];
    const mainActiveLink = document.querySelector(
      `.sidebar-nav-button[href*="${mainPage}"]`
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
    const profilePreview = document.getElementById("profilePreview");
    const defaultIcon = document.getElementById("defaultIcon");

    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB in bytes

      if (file && file.size > maxSize) {
        //file is too large
        errorMessage.textContent = "File size exceeds 2MB limit.";
        errorMessage.classList.remove("hidden");
        this.value = ""; // Clear the file input
      } else {
        //file is a valid size
        errorMessage.textContent = "";
        errorMessage.classList.add("hidden");
        //displays profile picture on frontend before submit
        profilePreview.src = URL.createObjectURL(file);
        //this toggles away the default icon placeholder in case there was no profile picture before
        profilePreview.classList.remove("hidden");
        defaultIcon.classList.add("hidden");
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

// Activity modal stuff
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

  // Mark notifications as read when dropdown is opened
  notificationIcon.addEventListener("click", function () {
    // Remove the red dot indicator when notifications are viewed
    const redDot = notificationIcon.querySelector(".rounded-full");
    if (redDot) {
      redDot.classList.add("hidden");
    }

    // Call API to mark notifications as read
    fetch("/api/notifications/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .catch((error) =>
        console.error("Error marking notifications as read:", error)
      );
  });
});

// Character Work

// In app.js
const express = require('express');
const pool = require('./path-to-your-db-connection'); // Make sure this path is correct

// Set up your character API routes
app.get('/api/character', async (req, res) => {
  try {
    // Get user ID from session
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Query the database for the character customization
    const query = 'SELECT * FROM character_customizations WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length === 0) {
      // No character found for this user
      return res.json(null);
    }
    
    // Return the character data
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching character data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/character', async (req, res) => {
  try {
    // Get user ID from session
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const { character_name, hat_choice, color_choice } = req.body;
    
    // Check if user already has a character customization
    const checkQuery = 'SELECT * FROM character_customizations WHERE user_id = $1';
    const checkResult = await pool.query(checkQuery, [userId]);
    
    let result;
    
    if (checkResult.rows.length > 0) {
      // Update existing character
      const updateQuery = `
        UPDATE character_customizations 
        SET character_name = $1, hat_choice = $2, color_choice = $3, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
        RETURNING *
      `;
      result = await pool.query(updateQuery, [character_name, hat_choice, color_choice, userId]);
    } else {
      // Create new character
      const insertQuery = `
        INSERT INTO character_customizations (user_id, character_name, hat_choice, color_choice)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      result = await pool.query(insertQuery, [userId, character_name, hat_choice, color_choice]);
    }
    
    // Return the saved character data
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error saving character data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});