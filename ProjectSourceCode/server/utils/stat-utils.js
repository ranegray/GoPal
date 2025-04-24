function calculateStreak(activities) {
  if (!activities || activities.length === 0) {
    return 0;
  }
  
  // Get unique dates from activities
  const uniqueDates = new Set();
  activities.forEach(activity => {
    // Handle both Date objects and string dates
    const dateStr = typeof activity.activity_date === 'string' 
      ? activity.activity_date.split('T')[0] 
      : activity.activity_date.toISOString().split('T')[0];
    uniqueDates.add(dateStr);
  });
  
  // For simplicity, count consecutive days starting from today
  const today = new Date();
  let streak = 0;
  
  for (let i = 0; i < 30; i++) { // Check up to 30 days back
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const checkDateStr = checkDate.toISOString().split('T')[0];
    
    if (uniqueDates.has(checkDateStr)) {
      streak++;
    } else if (streak > 0) {
      // Break on first missing day after streak starts
      break;
    }
  }
  
  return streak;
}

function getStatsForRange(activityData, startDate, endDate) {
  // Filter activities that fall within the specified date range
  const filteredActivites = activityData.filter((activity) => {
    const activityDate = new Date(activity.activity_date);
    return (
      activityDate >= new Date(startDate) && activityDate <= new Date(endDate)
    );
  });

  // Calculate statistics based on filtered data
  const totalDistance = filteredActivites.reduce(
    (sum, activity) => sum + (parseFloat(activity.distance_mi) || 0),
    0
  );
  const totalDuration = filteredActivites.reduce(
    (sum, activity) => sum + (activity.duration_minutes || 0),
    0
  );

  // Calculate current streak
  const currentStreak = calculateStreak(activityData);

  return {
    startDate: new Date(startDate).toLocaleDateString(),
    endDate: new Date(endDate).toLocaleDateString(),
    activityCount: filteredActivites.length,
    totalDistance: totalDistance.toFixed(2),
    totalDuration: totalDuration,
    activities: filteredActivites,
    currentStreak: currentStreak,
  };
}

function getJournalStats(journalData) {
  if (!journalData || journalData.length === 0) {
    return {
      totalEntries: 0,
      latestEntry: null,
    };
  }

  // Placeholder logic for when journalData exists:
  const totalEntries = journalData.length;
  let latestEntry = journalData[0];
  journalData.forEach(entry => {
    const currentEntryDate = new Date(entry.entry_date);
    if (currentEntryDate > new Date(latestEntry.entry_date)) {
      latestEntry = entry;
    }
  });

  return {
    totalEntries,
    latestEntry,
  };
}

module.exports = {
  calculateStreak,
  getStatsForRange,
  getJournalStats,
};

