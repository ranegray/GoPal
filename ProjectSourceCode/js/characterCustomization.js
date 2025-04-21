document.addEventListener('DOMContentLoaded', function() {

    // Mode switching elements
    const viewMode = document.getElementById('view-mode');
    const editMode = document.getElementById('edit-mode');
    const editButton = document.getElementById('edit-button');
    const cancelButton = document.getElementById('cancel-button');
    
    // Form elements
    const form = document.getElementById('character-form');
    const nameInput = document.getElementById('characterName');
    const hatOptions = document.querySelectorAll('.hat-option');
    const colorOptions = document.querySelectorAll('.color-option');
    
    // Current selections
    let currentSelections = {
      name: 'Unnamed Pal',
      hat: '',
      color: 'default'
    };
    
    // Original values to restore on cancel
    let originalValues = { ...currentSelections };
    
    // Load character data from database when page loads
    loadCharacterFromDatabase();
    
    // Function to load character data from the database
    function loadCharacterFromDatabase() {
      // Optional: Show a loading indicator
      const characterCard = document.querySelector('.character-card');
      if (characterCard) {
        characterCard.classList.add('loading'); // You can define this class in your CSS
      }
      
      // Fetch character data for the current user
      fetch('/api/character', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // If character data was found
        if (data && data.character) {
          // Update current selections with data from database
          currentSelections.name = data.character.characterName || 'Unnamed Pal';
          currentSelections.hat = data.character.hatChoice || '';
          currentSelections.color = data.character.colorChoice || 'default';
          
          console.log('Loaded character data:', currentSelections);
          
          // Update original values to match
          originalValues = { ...currentSelections };
          
          // Apply the loaded data to the UI
          // applySelectionsToUI();
        } else {
          console.log('No saved character found, using defaults');
          // Keep using default values
          updateCharacterName();
          updateCharacterImage();
        }
      })
      .catch(error => {
        console.error('Error loading character:', error);
        // On error, still initialize with default values
        updateCharacterName();
        updateCharacterImage();
      })
      .finally(() => {
        // Remove loading indicator if we added one
        if (characterCard) {
          characterCard.classList.remove('loading');
        }
      });
    }
    
    // Apply current selections to the UI elements
    function applySelectionsToUI() {
      // Update name input
      nameInput.value = currentSelections.name;
      
      // Update hat selection
      hatOptions.forEach(btn => {
        btn.classList.remove('border-blue-500', 'bg-blue-50');
        if (btn.getAttribute('data-hat') === currentSelections.hat) {
          btn.classList.add('border-blue-500', 'bg-blue-50');
        }
      });
      
      // Update color selection
      colorOptions.forEach(btn => {
        btn.classList.remove('border-gray-800');
        if (btn.getAttribute('data-color') === currentSelections.color) {
          btn.classList.add('border-gray-800');
        }
      });
      
      // Update character display
      updateCharacterName();
      updateCharacterImage();
    }
    
    // Update character image based on selections
    function updateCharacterImage() {
      const hat = currentSelections.hat || 'none';
      const color = currentSelections.color || 'default';
      
      // Create base image path
      let imagePath = '../../extra_resources/character_assets/';
      
      if (hat === 'none' || hat === '') {
        // No hat selected
        if (color === 'default') {
          // No color selected either, use base monster
          imagePath = imagePath + `basemonster.svg`;
        } else {
          // Color selected but no hat
          imagePath = imagePath + `basemonster_${color}.svg`;
        }
      } else {
        // Hat selected
        if (color === 'default') {
          // Hat selected but no color, use default color with hat
          imagePath = imagePath + `monster_default_${hat}.svg`;
        } else {
          // Both hat and color selected
          imagePath = imagePath + `monster_${color}_${hat}.svg`;
        }
      }
      
      document.querySelectorAll('.character-card img').forEach(img => {
        img.src = imagePath;
        img.alt = `${currentSelections.name} with ${hat !== 'none' ? hat + ' hat' : 'no hat'}`;
      });
    }
    
    // Update character name
    function updateCharacterName() {
      const name = currentSelections.name;
      document.querySelectorAll('.character-card h2').forEach(el => {
        el.textContent = name;
      });
    }
    
    // Toggle between view and edit modes
    editButton.addEventListener('click', function() {
      // Save current values before editing
      originalValues = { ...currentSelections };
      
      // Show edit mode
      viewMode.classList.add('hidden');
      editMode.classList.remove('hidden');
    });
    
    // Handle cancel button click
    cancelButton.addEventListener('click', function() {
      // Restore original values
      currentSelections = { ...originalValues };
      
      // Apply original values to UI
      applySelectionsToUI();
      
      // Switch back to view mode
      editMode.classList.add('hidden');
      viewMode.classList.remove('hidden');
    });
    
    // Update name in real-time
    nameInput.addEventListener('input', function() {
      currentSelections.name = this.value || 'Unnamed Pal';
      updateCharacterName();
    });
    
    // Handle hat selection
    hatOptions.forEach(button => {
      button.addEventListener('click', function() {
        hatOptions.forEach(btn => btn.classList.remove('border-blue-500', 'bg-blue-50'));
        this.classList.add('border-blue-500', 'bg-blue-50');
        
        currentSelections.hat = this.getAttribute('data-hat');
        updateCharacterImage();
      });
    });
    
    // Handle color selection
    colorOptions.forEach(button => {
      button.addEventListener('click', function() {
        colorOptions.forEach(btn => btn.classList.remove('border-gray-800'));
        this.classList.add('border-gray-800');
        
        currentSelections.color = this.getAttribute('data-color');
        updateCharacterImage();
      });
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Create data object for the API call
      const characterData = {
        characterName: currentSelections.name,
        hatChoice: currentSelections.hat,
        colorChoice: currentSelections.color
      };
      
      // Send the data to the server
      fetch('/api/character', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        // Save the current values as the original values for next edit session
        originalValues = { ...currentSelections };
        
        // Switch back to view mode after saving
        editMode.classList.add('hidden');
        viewMode.classList.remove('hidden');
        
        // Show success message
        alert(data.message || 'Character saved successfully!');
      })
      .catch(error => {
        console.error('Error saving character:', error);
        alert('Error saving character. Please try again.');
      });
    });
});