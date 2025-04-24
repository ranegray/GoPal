async function searchUser() {
  const username = document.getElementById("search-input").value;
  try {
    const response = await fetch(`/search/${username}`, { method: "POST" });
    const result = await response.json();
    const message = result.message || "Something went wrong.";
    localStorage.setItem("searchMessage", message); // Save message
    location.reload(); // Refresh the page to update the friend list
  } catch (err) {
    document.getElementById("search-result").textContent = "User not found";
  }
}
async function acceptFriend(userId) {
  try {
    const response = await fetch(`/accept-friend/${userId}`, {
      method: "POST",
    });
    const result = await response.json();
    location.reload(); // Refresh the page to update the friend list
  } catch (err) {
    alert("Error accepting friend request.");
  }
}

async function declineFriend(userId) {
  try {
    const response = await fetch(`/decline-friend/${userId}`, {
      method: "POST",
    });
    const result = await response.json();
    location.reload(); // Refresh the page to update the friend list
  } catch (err) {
    alert("Error declining friend request.");
  }
}

let currentActivityId = null; // Store which activity is being commented on

function commentOnActivity(activityId) {
  currentActivityId = activityId;
  document.getElementById("comment-text").value = ""; // Clear old text
  document.getElementById("comment-modal").classList.remove("hidden");
}

function closeCommentModal() {
  document.getElementById("comment-modal").classList.add("hidden");
}

async function submitComment() {
  const comment = document.getElementById("comment-text").value.trim();
  if (!comment) {
    alert("Please write a comment before sending!");
    return;
  }

  try {
    const response = await fetch(`/comment/${currentActivityId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });

    const result = await response.json();
    if (result.success) {
      closeCommentModal();
      // Reload the page to show the new comment
      window.location.reload();
    } else {
      alert("Failed to send comment.");
    }
  } catch (err) {
    console.error("Error submitting comment:", err);
    alert("Error sending comment.");
  }
}

// Initialize liked activities from local storage when page loads
document.addEventListener("DOMContentLoaded", () => {
  initializeLikedButtons();
});

/**
 * Initialize like buttons based on localStorage data
 */
function initializeLikedButtons() {
  // Get the saved likes from localStorage
  const likedActivities = getLikedActivities();

  // Find all like buttons on the page
  const likeButtons = document.querySelectorAll(".like-button");

  // Update each button's appearance based on localStorage data
  likeButtons.forEach((button) => {
    const activityId = button.dataset.activityId;
    if (likedActivities.includes(activityId)) {
      const heartIcon = button.querySelector("svg");
      if (heartIcon) {
        heartIcon.setAttribute("fill", "red");
      }
    }
  });
}

/**
 * Toggle like status for an activity and save to localStorage
 * @param {HTMLElement} button - The like button element
 * @param {string} activityId - ID of the activity to like/unlike
 */
function toggleLike(button, activityId) {
  // Get the heart icon SVG
  const heartIcon = button.querySelector("svg");
  if (!heartIcon) return;

  // Get current liked activities
  const likedActivities = getLikedActivities();

  // Check if this activity is already liked
  const isLiked = heartIcon.getAttribute("fill") === "red";

  if (isLiked) {
    // Unlike: Remove from localStorage and change heart color
    const index = likedActivities.indexOf(activityId.toString());
    if (index > -1) {
      likedActivities.splice(index, 1);
    }
    heartIcon.setAttribute("fill", "none");
  } else {
    // Like: Add to localStorage and change heart color
    likedActivities.push(activityId.toString());
    heartIcon.setAttribute("fill", "red");
  }

  // Save updated likes to localStorage
  localStorage.setItem("likedActivities", JSON.stringify(likedActivities));
}

/**
 * Get the array of liked activity IDs from localStorage
 * @returns {string[]} Array of activity IDs that the user has liked
 */
function getLikedActivities() {
  const savedLikes = localStorage.getItem("likedActivities");
  return savedLikes ? JSON.parse(savedLikes) : [];
}
