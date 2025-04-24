function getCurrentWeekRange() {
  // Get current date
  const now = new Date();

  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const currentDay = now.getDay();

  // Calculate days to subtract to get to Sunday (start of week)
  const daysToSubtract = currentDay;

  // Create a new date object for the start of the week (Sunday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToSubtract);
  startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of the day

  // Create a new date object for the end of the week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999); // Set to end of the day

  return {
    startDate: startOfWeek,
    endDate: endOfWeek,
  };
}

function getCurrentMonthRange() {
  // Get current date
  const now = new Date();

  // Create a new date object for the start of the month
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  startOfMonth.setHours(0, 0, 0, 0); // Set to beginning of the day

  // Create a new date object for the end of the month
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

  return {
    startDate: startOfMonth,
    endDate: endOfMonth,
  };
}

function getCurrentQuarterRange() {
  // Get current date
  const now = new Date();
  
  // Create a new date object for three months ago
  // By subtracting 3 from the current month
  const startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  startDate.setHours(0, 0, 0, 0); // Set to beginning of the day
  
  // Create a new date object for the end of the current month
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  endDate.setHours(23, 59, 59, 999); // Set to end of the day
  
  return {
    startDate: startDate,
    endDate: endDate,
  };
}

function getCurrentYearRange() {
  // Get current date
  const now = new Date();

  // Create a new date object for the start of the year
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  startOfYear.setHours(0, 0, 0, 0); // Set to beginning of the day

  // Create a new date object for the end of the year
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  endOfYear.setHours(23, 59, 59, 999); // Set to end of the day

  return {
    startDate: startOfYear,
    endDate: endOfYear,
  };
}

function getDateRange(dateRange) {
  switch (dateRange) {
    case "week":
      return getCurrentWeekRange();
    case "month":
      return getCurrentMonthRange();
    case "quarter":
      return getCurrentQuarterRange();
    case "year":
      return getCurrentYearRange();
    default:
      throw new Error("Invalid date range");
  }
}

module.exports = {
  getCurrentWeekRange,
  getCurrentMonthRange,
  getCurrentYearRange,
  getDateRange,
};
