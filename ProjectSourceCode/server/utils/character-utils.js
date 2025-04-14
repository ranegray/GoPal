// server/utils/character-utils.js
const db = require("../db.js");

/**
 * Get character information for a user
 * @param {number} userId - The user's ID
 * @returns {Promise<Object>} Character information
 */
async function getCharacterInfo(userId) {
  try {
    // First check if the user has a character
    let character = await db.oneOrNone(
      'SELECT * FROM character_customizations WHERE user_id = $1',
      [userId]
    );

    // If no character exists, create a default one
    if (!character) {
      character = await createDefaultCharacter(userId);
    }

    // Get the character's evolution stage
    const evolutionStage = await db.one(
      `SELECT * FROM character_evolution_stages 
       WHERE level = $1`,
      [character.level]
    );

    // Get next level information (if any)
    const nextLevel = await db.oneOrNone(
      `SELECT * FROM character_evolution_stages
       WHERE min_xp > $1
       ORDER BY min_xp ASC
       LIMIT 1`,
      [character.xp]
    );

    return {
      character,
      evolutionStage,
      nextLevel,
      xpToNextLevel: nextLevel ? nextLevel.min_xp - character.xp : 0
    };
  } catch (err) {
    console.error("Error getting character info:", err);
    throw err;
  }
}

/**
 * Create a default character for a user
 * @param {number} userId - The user's ID
 * @returns {Promise<Object>} The created character
 */
async function createDefaultCharacter(userId) {
  try {
    return await db.one(
      `INSERT INTO character_customizations 
       (user_id, character_name, color_choice, xp, level)
       VALUES ($1, 'Unnamed Pal', 'default', 0, 1)
       RETURNING *`,
      [userId]
    );
  } catch (err) {
    console.error("Error creating default character:", err);
    throw err;
  }
}

/**
 * Update character customization options
 * @param {number} userId - The user's ID
 * @param {Object} updates - Character customization updates
 * @returns {Promise<Object>} Updated character
 */
async function updateCharacter(userId, updates) {
  try {
    const updateFields = [];
    const queryParams = [userId];
    let paramCounter = 2;

    // Build dynamic query based on provided updates
    if (updates.character_name) {
      updateFields.push(`character_name = $${paramCounter++}`);
      queryParams.push(updates.character_name);
    }
    
    if (updates.hat_choice) {
      updateFields.push(`hat_choice = $${paramCounter++}`);
      queryParams.push(updates.hat_choice);
    }
    
    if (updates.color_choice) {
      updateFields.push(`color_choice = $${paramCounter++}`);
      queryParams.push(updates.color_choice);
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    if (updateFields.length === 0) {
      throw new Error('No valid update fields provided');
    }

    // Execute update
    return await db.one(
      `UPDATE character_customizations
       SET ${updateFields.join(', ')}
       WHERE user_id = $1
       RETURNING *`,
      queryParams
    );
  } catch (err) {
    console.error("Error updating character:", err);
    throw err;
  }
}

/**
 * Award XP for an achievement
 * @param {number} userId - The user's ID
 * @param {number} achievementId - ID of the achievement earned
 * @returns {Promise<Object>} Updated character info with evolution status
 */
async function awardXpForAchievement(userId, achievementId) {
  try {
    // Get the XP reward for this achievement
    const rewardResult = await db.oneOrNone(
      'SELECT xp_reward FROM achievement_rewards WHERE achievement_id = $1',
      [achievementId]
    );
    
    const xpAmount = rewardResult ? rewardResult.xp_reward : 25; // Default XP if no specific reward
    
    // Now award the XP
    return await awardXp(userId, xpAmount, 'Achievement reward');
  } catch (err) {
    console.error("Error awarding achievement XP:", err);
    throw err;
  }
}

/**
 * Award XP to a character directly
 * @param {number} userId - The user's ID
 * @param {number} xpAmount - Amount of XP to award
 * @param {string} reason - Reason for the XP award
 * @returns {Promise<Object>} Updated character info with evolution status
 */
async function awardXp(userId, xpAmount, reason) {
  try {
    // Get current character info
    let currentCharacter = await db.oneOrNone(
      'SELECT * FROM character_customizations WHERE user_id = $1',
      [userId]
    );
    
    // If no character exists, create one
    if (!currentCharacter) {
      currentCharacter = await createDefaultCharacter(userId);
    }
    
    const newXp = currentCharacter.xp + xpAmount;
    
    // Determine new level based on XP
    const newLevelData = await db.oneOrNone(
      `SELECT level FROM character_evolution_stages
       WHERE min_xp <= $1
       ORDER BY min_xp DESC
       LIMIT 1`,
      [newXp]
    );
    
    const newLevel = newLevelData ? newLevelData.level : 1;
    const didLevelUp = newLevel > currentCharacter.level;
    
    // Update character
    const updatedCharacter = await db.one(
      `UPDATE character_customizations
       SET xp = $1,
           level = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3
       RETURNING *`,
      [newXp, newLevel, userId]
    );
    
    // If character leveled up, create a notification
    if (didLevelUp) {
      const evolutionStage = await db.one(
        'SELECT * FROM character_evolution_stages WHERE level = $1',
        [newLevel]
      );
      
      await db.none(
        `INSERT INTO notifications (
          user_id, type, reference_id, title, message, is_read
        ) VALUES (
          $1, 'CHARACTER_EVOLUTION', $2, 'Your Pal Evolved!', 
          $3, FALSE
        )`,
        [
          userId, 
          newLevel, 
          `Your pal has evolved to ${evolutionStage.name}! ${evolutionStage.description}`
        ]
      );
    }
    
    // Create XP notification
    await db.none(
      `INSERT INTO notifications (
        user_id, type, reference_id, title, message, is_read
      ) VALUES (
        $1, 'XP_GAIN', $2, 'XP Gained', $3, FALSE
      )`,
      [
        userId, 
        xpAmount, 
        `You gained ${xpAmount} XP! ${reason ? '(' + reason + ')' : ''}`
      ]
    );
    
    return {
      character: updatedCharacter,
      didLevelUp,
      newLevel,
      oldLevel: currentCharacter.level,
      xpGained: xpAmount
    };
  } catch (err) {
    console.error("Error awarding XP:", err);
    throw err;
  }
}

module.exports = {
  getCharacterInfo,
  createDefaultCharacter,
  updateCharacter,
  awardXp,
  awardXpForAchievement
};