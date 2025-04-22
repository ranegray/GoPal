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
    const response = await fetch(`/accept-friend/${userId}`, { method: "POST" });
    const result = await response.json();
    location.reload(); // Refresh the page to update the friend list
} catch (err) {
    alert("Error accepting friend request.");
}
}

async function declineFriend(userId) {
try {
    const response = await fetch(`/decline-friend/${userId}`, { method: "POST" });
    const result = await response.json();
    location.reload(); // Refresh the page to update the friend list
} catch (err) {
    alert("Error declining friend request.");
}
}

let currentActivityId = null; // Store which activity is being commented on

function commentOnActivity(activityId) {
  currentActivityId = activityId;
  document.getElementById('comment-text').value = ""; // Clear old text
  document.getElementById('comment-modal').classList.remove('hidden');
}

function closeCommentModal() {
  document.getElementById('comment-modal').classList.add('hidden');
}

async function submitComment() {
  const comment = document.getElementById('comment-text').value.trim();
  if (!comment) {
    alert("Please write a comment before sending!");
    return;
  }

  try {
    const response = await fetch(`/comment/${currentActivityId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment })
    });

    const result = await response.json();
    if (result.success) {
      alert("Comment sent!");
      closeCommentModal();
    } else {
      alert("Failed to send comment.");
    }
  } catch (err) {
    console.error("Error submitting comment:", err);
    alert("Error sending comment.");
  }
}