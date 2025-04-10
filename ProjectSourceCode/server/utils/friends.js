async function searchUser() {
    const username = document.getElementById("search-input").value;
    try {
        const response = await fetch(`/search/${username}`, { method: "POST" });
        const result = await response.json();
        const message = result.message || "Something went wrong.";
        document.getElementById("search-result").textContent = message;
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