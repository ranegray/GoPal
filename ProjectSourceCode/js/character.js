// js/character.js
async function saveCharacterCustomization(characterData) {
    try {
      const response = await fetch('/api/character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save character');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error saving character:', error);
      throw error;
    }
  }
  
  async function getCharacterCustomization() {
    try {
      const response = await fetch('/api/character');
      if (!response.ok) {
        throw new Error('Failed to fetch character');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching character:', error);
      return null;
    }
  }