const db = require("../db.js");
const pgp = require("pg-promise")();

async function createAchievementNotifications(userId, achievementIds) {
  try {
    if (!achievementIds.length) return;

    // Get achievement details
    const achievements = await db.any(
      "SELECT id, name, description FROM achievements WHERE id IN ($1:csv)",
      [achievementIds]
    );

    // Create notification records (some AI generated stuff I don't completely understand)
    const cs = new pgp.helpers.ColumnSet(
      ["user_id", "type", "reference_id", "title", "message", "is_read"],
      { table: "notifications" }
    );

    const values = achievements.map((achievement) => ({
      user_id: userId,
      type: "ACHIEVEMENT",
      reference_id: achievement.id,
      title: "Achievement Unlocked!",
      message: `${achievement.name}: ${achievement.description}`,
      is_read: false,
    }));

    const query = pgp.helpers.insert(values, cs);
    await db.none(query);

    return achievements;
  } catch (err) {
    console.error("Error creating notifications:", err);
    return [];
  }
}

module.exports = {
  createAchievementNotifications,
};
