import { passwordErrorText } from "./password_error.js";

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

    // Character counter for bio field
    const bioField = document.getElementById("userBio");
    const bioCharCount = document.getElementById("bioCharCount");
    
    if (bioField && bioCharCount) {
        // Set initial count on page load based on existing bio
        bioCharCount.textContent = bioField.value.length;
        
        // Update count as user types
        bioField.addEventListener("input", function() {
            bioCharCount.textContent = this.value.length;
        });
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
// if (window.location.pathname === "/home") {
//   getLocation();
// }

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

    //delete account button logic
    document.addEventListener("DOMContentLoaded", function () {
      const deleteAccountButton = document.getElementById("delete-account-button");
      deleteAccountButton.addEventListener("click", function () {
        if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
          document.getElementById("delete-account-form").submit();
        }
      });
    });
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

  // Activity menu dropdown functionality
  const menuButtons = document.querySelectorAll('.activity-menu-button');
  
  if (menuButtons.length > 0) {
    // Toggle dropdown when menu button is clicked
    menuButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event from bubbling up
        
        const activityId = this.getAttribute('data-activity-id');
        const menuElement = document.getElementById(`menu-${activityId}`);
        
        // Close all other open menus first
        document.querySelectorAll('.activity-menu').forEach(menu => {
          if (menu.id !== `menu-${activityId}`) {
            menu.classList.add('hidden');
          }
        });
        
        // Toggle this menu
        menuElement.classList.toggle('hidden');
      });
    });
    
    // Close dropdown when clicking anywhere else on the page
    document.addEventListener('click', function() {
      document.querySelectorAll('.activity-menu').forEach(menu => {
        menu.classList.add('hidden');
      });
    });
    
    // Prevent clicks inside dropdown from closing it
    document.querySelectorAll('.activity-menu').forEach(menu => {
      menu.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
  }

  // Edit Activity Modal
  const editActivityModal = document.getElementById("edit-activity-modal");
  const editActivityForm = document.getElementById("edit-activity-form");
  const editCloseModalButton = document.getElementById("edit-close-modal-button");
  const editCancelButton = document.getElementById("edit-cancel-button");
  const editActivityButtons = document.querySelectorAll(".edit-activity-button");

  // Open edit activity modal when an edit button is clicked
  if (editActivityButtons.length > 0) {
    editActivityButtons.forEach(button => {
      button.addEventListener("click", function() {
        // Get activity data from data attributes
        const activityId = this.getAttribute("data-activity-id");
        const activityTypeId = this.getAttribute("data-activity-type-id");
        const activityName = this.getAttribute("data-activity-name");
        const activityDuration = this.getAttribute("data-activity-duration");
        const activityDistance = this.getAttribute("data-activity-distance");
        const activityDate = this.getAttribute("data-activity-date");
        const activityTime = this.getAttribute("data-activity-time");
        const activityNotes = this.getAttribute("data-activity-notes");

        // Set values in the edit form
        document.getElementById("edit-activity-id").value = activityId;
        
        // Find and select the appropriate option in the dropdown
        const typeSelect = document.getElementById("edit-activity-type");
        for (let i = 0; i < typeSelect.options.length; i++) {
          if (typeSelect.options[i].text === activityName) {
            typeSelect.selectedIndex = i;
            break;
          }
        }
        
        document.getElementById("edit-activity-duration").value = activityDuration;
        document.getElementById("edit-activity-distance").value = activityDistance;
        
        // Format date for input (yyyy-MM-dd)
        if (activityDate) {
          const date = new Date(activityDate);
          const formattedDate = date.toISOString().split('T')[0];
          document.getElementById("edit-activity-date").value = formattedDate;
        }
        
        // Set time if available
        if (activityTime) {
          document.getElementById("edit-activity-time").value = activityTime;
        }
        
        document.getElementById("edit-activity-notes").value = activityNotes || '';
        
        // Set the form action to the correct endpoint
        editActivityForm.action = `/api/activities/${activityId}`;
        
        // Show the modal
        editActivityModal.classList.remove("hidden");
        editActivityModal.classList.add("flex");
      });
    });
  }

  // Close edit activity modal functions
  function closeEditModal() {
    editActivityModal.classList.add("hidden");
    editActivityModal.classList.remove("flex");
    editActivityForm.reset();
  }

  if (editCloseModalButton) {
    editCloseModalButton.addEventListener("click", closeEditModal);
  }

  if (editCancelButton) {
    editCancelButton.addEventListener("click", closeEditModal);
  }
});

// CHARACTER WORK:
// In app.js
// Conditionally load the character customization script
if (window.location.pathname === "/settings/pal-settings") {
  import('./characterCustomization.js').catch(err => {
    console.error("Error loading character customization script:", err);
  });
}

//ensures search message stays after friends list reload
window.addEventListener("DOMContentLoaded", () => {
  const storedMessage = localStorage.getItem("searchMessage");
  if (storedMessage) {
      document.getElementById("search-result").textContent = storedMessage;
      localStorage.removeItem("searchMessage"); // Clear it after displaying
  }
});
// Separate DOMContentLoaded listener for Journal Modal logic
document.addEventListener("DOMContentLoaded", function () {
  // --- Journal Modal Elements ---
  const journalModal = document.getElementById("journal-modal");
  const journalForm = document.getElementById("journal-form");
  const journalCloseModalButton = document.getElementById("journal-close-modal-button");
  const journalCancelButton = document.getElementById("journal-cancel-button"); 
  const journalAddButton = document.getElementById("journal-add-button");

  if (journalAddButton) {
    journalAddButton.addEventListener("click", function () {
      journalModal.classList.remove("hidden");
      journalModal.classList.add("flex");
    });
  }

  function closeModal() {
    journalModal.classList.add("hidden");
    journalModal.classList.remove("flex");
    journalForm.reset();
  }

  if (journalCloseModalButton) {
    journalCloseModalButton.addEventListener("click", closeModal);
  }

  if (journalCancelButton) {
    journalCancelButton.addEventListener("click", closeModal);
  }
}); 


// Friend Profile Modal
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the friends page
  if (window.location.pathname.includes('/social/friends')) {
    const profileButtons = document.querySelectorAll('.profile-button');
    const modal = document.getElementById('friend-profile-modal');
    const modalContent = document.getElementById('friend-profile-content');
    const closeModal = document.getElementById('close-friend-modal');
    
    // Function to load user profile
    function loadUserProfile(userId) {
      
      // Fetch the profile content from the server using POST
      fetch('/user-profile-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
      })
      .then(response => response.text())
      .then(html => {
        //set the modal content to the fetched HTML, and reveal the modal
        modalContent.innerHTML = html;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      })
      .catch(error => {
        console.error('Error loading friend profile:', error);
        modalContent.innerHTML = '<div class="p-4 text-red-500">Error loading profile. Please try again.</div>';
      });
    }
    
    // Add click event to each friend item
    profileButtons.forEach(item => {
      item.addEventListener('click', function() {
        const userId = this.getAttribute('user-id');
        loadUserProfile(userId);
      });
    });
    
    // Close modal when clicking the close button
    if (closeModal) {
      closeModal.addEventListener('click', function() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      });
    }
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(event) {
      if (event.target === modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    });
  }
});
