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
  const currentStreak = activityData.reduce((streak, activity) => {
    const activityDate = new Date(activity.activity_date);
    if (
      activityDate >= new Date(startDate) &&
      activityDate <= new Date(endDate)
    ) {
      const daysSinceLastActivity = Math.floor(
        (new Date() - activityDate) / (1000 * 60 * 60 * 24)
      );
      return Math.max(streak, daysSinceLastActivity);
    }
    return streak;
  }, 0);

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

module.exports = {
  getStatsForRange,
};
