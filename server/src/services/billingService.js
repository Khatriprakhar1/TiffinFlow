/**
 * Billing Service
 * Core business logic for tiffin subscription billing.
 * Handles weekday calculations and pro-rated billing.
 */

/**
 * Check if a given date is a weekday (Mon-Fri)
 * @param {Date} date
 * @returns {boolean}
 */
function isWeekday(date) {
  const day = date.getDay();
  return day !== 0 && day !== 6; // 0 = Sunday, 6 = Saturday
}

/**
 * Get total number of weekdays in a given month/year.
 * @param {number} year - Full year (e.g. 2026)
 * @param {number} month - Month (1-12)
 * @returns {number} Total weekdays in that month
 */
function getWeekdaysInMonth(year, month) {
  // month is 1-indexed, JS Date uses 0-indexed months
  const daysInMonth = new Date(year, month, 0).getDate();
  let weekdays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    if (isWeekday(date)) {
      weekdays++;
    }
  }

  return weekdays;
}

/**
 * Get number of weekdays between two dates (inclusive).
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {number} Weekdays in the range [startDate, endDate]
 */
function getWeekdaysBetweenDates(startDate, endDate) {
  let weekdays = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    if (isWeekday(current)) {
      weekdays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return weekdays;
}

/**
 * Calculate the bill for a customer's subscription for a given month.
 *
 * Formula:
 *   billableDays = totalWeekdaysInMonth - pausedWeekdays
 *   dailyRate = monthlyPlanPrice / totalWeekdaysInMonth
 *   finalBill = dailyRate * billableDays
 *
 * @param {number} monthlyPrice - The monthly plan price
 * @param {number} year - Billing year
 * @param {number} month - Billing month (1-12)
 * @param {Array} pausePeriods - Array of { startDate, endDate } objects
 * @returns {Object} Billing breakdown
 */
function calculateBill(monthlyPrice, year, month, pausePeriods = []) {
  const totalWeekdays = getWeekdaysInMonth(year, month);

  // Calculate the billing month boundaries
  const monthStart = new Date(year, month - 1, 1);
  monthStart.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, month, 0); // last day of month
  monthEnd.setHours(23, 59, 59, 999);

  // Calculate paused weekdays, handling overlapping periods
  // Strategy: collect all paused dates in a Set to avoid double-counting
  const pausedDatesSet = new Set();

  for (const period of pausePeriods) {
    const pStart = new Date(period.startDate);
    pStart.setHours(0, 0, 0, 0);

    // If endDate is null, the pause is ongoing — use monthEnd as effective end
    const pEnd = period.endDate ? new Date(period.endDate) : new Date(monthEnd);
    pEnd.setHours(0, 0, 0, 0);

    // Clamp pause period to the billing month
    const effectiveStart = pStart < monthStart ? new Date(monthStart) : new Date(pStart);
    const effectiveEnd = pEnd > monthEnd ? new Date(monthEnd) : new Date(pEnd);

    if (effectiveStart > effectiveEnd) continue; // pause period doesn't overlap with billing month

    const current = new Date(effectiveStart);
    while (current <= effectiveEnd) {
      if (isWeekday(current)) {
        // Use date string as key to avoid duplicate counting
        pausedDatesSet.add(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
  }

  const pausedWeekdays = pausedDatesSet.size;
  const billableDays = totalWeekdays - pausedWeekdays;
  const dailyRate = totalWeekdays > 0 ? monthlyPrice / totalWeekdays : 0;
  const finalBill = Math.round(dailyRate * billableDays * 100) / 100;

  return {
    year,
    month,
    totalWeekdays,
    pausedWeekdays,
    billableDays,
    monthlyPrice,
    dailyRate: Math.round(dailyRate * 100) / 100,
    finalBill
  };
}

module.exports = {
  isWeekday,
  getWeekdaysInMonth,
  getWeekdaysBetweenDates,
  calculateBill
};
