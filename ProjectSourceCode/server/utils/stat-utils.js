function calculateCurrentConsecutiveStreak(activityData) {
  if (!activityData || activityData.length === 0) {
    return 0; // No data, no streak
  }

  // 1. Create a Set of unique activity dates (as 'YYYY-MM-DD' strings in UTC)
  const activityDateStrings = new Set();
  activityData.forEach(activity => {
    try {
      const d = new Date(activity.activity_date);
      // Check if the date is valid before proceeding
      if (!isNaN(d.getTime())) {
         // Normalize to a UTC date string 'YYYY-MM-DD'
         // This avoids issues with timezones and daylight saving time shifts when comparing days
         const year = d.getUTCFullYear();
         const month = String(d.getUTCMonth() + 1).padStart(2, '0'); // months are 0-indexed
         const day = String(d.getUTCDate()).padStart(2, '0');
         activityDateStrings.add(`${year}-${month}-${day}`);
      } else {
        console.warn("Invalid date encountered in activityData:", activity.activity_date);
      }
    } catch (e) {
       console.error("Error parsing date:", activity.activity_date, e);
    }
  });

  if (activityDateStrings.size === 0) {
      return 0; // No valid dates found
  }

  // 2. Start checking from today (using UTC date)
  let streak = 0;
  const today = new Date();
  // Use a temporary date object, starting at the beginning of today UTC
  let currentDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  // 3. Loop backwards day by day
  while (true) {
    const year = currentDate.getUTCFullYear();
    const month = String(currentDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getUTCDate()).padStart(2, '0');
    const currentDateString = `${year}-${month}-${day}`;

    if (activityDateStrings.has(currentDateString)) {
      // Found an activity on this day, increment streak
      streak++;
      // Move to the previous day (UTC handles month/year changes)
      currentDate.setUTCDate(currentDate.getUTCDate() - 1);
    } else {
      // No activity on this day, streak broken
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
  const currentStreak = calculateCurrentConsecutiveStreak(activityData);

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
  getStatsForRange,
  getJournalStats,
};

