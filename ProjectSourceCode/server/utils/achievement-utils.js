const db = require("../db.js");
const pgp = require("pg-promise")();

async function checkAndAwardAchievements(userId) {
  try {
      const userRes = await db.oneOrNone('SELECT activities_completed_count FROM users WHERE user_id = $1', [userId]);
      if (!userRes) {
          console.error('User not found for achievement check:', userId);
          return [];
      }
      const activityCount = userRes.activities_completed_count;

      const unlockedRes = await db.any('SELECT achievement_id FROM user_achievements WHERE user_id = $1', [userId]);
      const unlockedAchievementIds = unlockedRes.map(row => row.achievement_id);

      const potentialAchievements = await db.any('SELECT id, criteria_type, criteria_value FROM achievements');

      const newlyUnlocked = [];
      for (const achievement of potentialAchievements) {
          // Skip if already unlocked
          if (unlockedAchievementIds.includes(achievement.id)) {
              continue;
          }

          // Check criteria
          let criteriaMet = false;
          if (achievement.criteria_type === 'ACTIVITY_COUNT') {
              if (activityCount >= achievement.criteria_value) {
                  criteriaMet = true;
              }
          }
          // Add checks for other criteria_types here

          if (criteriaMet) {
              newlyUnlocked.push(achievement.id);
          }
      }

      // Award newly unlocked achievements
      if (newlyUnlocked.length > 0) {
          // Use pg-promise's multi-row insert
          const cs = new pgp.helpers.ColumnSet(['user_id', 'achievement_id'], {table: 'user_achievements'});
          
          const values = newlyUnlocked.map(achievementId => ({
              user_id: userId,
              achievement_id: achievementId
          }));
          
          const query = pgp.helpers.insert(values, cs) + 
              ' ON CONFLICT (user_id, achievement_id) DO NOTHING';
          
          await db.none(query);
          console.log(`User ${userId} unlocked achievements: ${newlyUnlocked.join(', ')}`);
          return newlyUnlocked;
      }

  } catch (err) {
      console.error('Error checking/awarding achievements:', err);
  }
  return [];
}

module.exports = {
  checkAndAwardAchievements,
};
