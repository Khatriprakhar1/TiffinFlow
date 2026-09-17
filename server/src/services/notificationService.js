/**
 * Notification Service
 * Determines which customers are due a delivery on a given date
 * and generates notification records.
 */

const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const Notification = require('../models/Notification');
const { isWeekday } = require('./billingService');

/**
 * Check if a customer is paused on a given date.
 * A customer is considered paused if any pause period covers the date:
 *   - startDate <= date AND (endDate is null OR endDate >= date)
 *
 * @param {Array} pausePeriods - Array of { startDate, endDate } objects
 * @param {Date} date - The date to check
 * @returns {boolean} True if paused on that date
 */
function isPausedOnDate(pausePeriods, date) {
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  for (const period of pausePeriods) {
    const pStart = new Date(period.startDate);
    pStart.setHours(0, 0, 0, 0);

    if (pStart > checkDate) continue; // pause hasn't started yet

    if (period.endDate === null || period.endDate === undefined) {
      // Open-ended pause — still paused
      return true;
    }

    const pEnd = new Date(period.endDate);
    pEnd.setHours(0, 0, 0, 0);

    if (checkDate <= pEnd) {
      return true;
    }
  }

  return false;
}

/**
 * Generate delivery notifications for all eligible customers on a given date.
 *
 * Eligibility:
 *  1. Date is a weekday
 *  2. Customer status is 'active'
 *  3. Customer is NOT in a pause period on that date
 *
 * Idempotent: clears existing notifications for the date before generating new ones.
 *
 * @param {Date|string} dateInput - The date to generate notifications for
 * @returns {Object} { date, notified: [...], skipped: [...], summary }
 */
async function generateDeliveryNotifications(dateInput) {
  const date = dateInput ? new Date(dateInput) : new Date();
  date.setHours(0, 0, 0, 0);

  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

  // Check if it's a weekday
  if (!isWeekday(date)) {
    return {
      date: dateStr,
      isWeekday: false,
      notified: [],
      skipped: [],
      summary: {
        total: 0,
        notified: 0,
        skipped: 0,
        reason: 'Weekend — no deliveries scheduled'
      }
    };
  }

  // Clear existing notifications for this date (idempotency)
  await Notification.deleteMany({ date: dateStr });

  // Find all active customers
  const activeCustomers = await Customer.find({ status: 'active' });

  // Get all subscriptions in one query for efficiency
  const customerIds = activeCustomers.map(c => c._id);
  const subscriptions = await Subscription.find({
    customerId: { $in: customerIds }
  });

  // Create a lookup map: customerId -> subscription
  const subMap = new Map();
  for (const sub of subscriptions) {
    subMap.set(sub.customerId.toString(), sub);
  }

  const notified = [];
  const skipped = [];

  for (const customer of activeCustomers) {
    const sub = subMap.get(customer._id.toString());

    // No subscription = skip
    if (!sub) {
      skipped.push({
        customerId: customer._id,
        name: customer.name,
        phone: customer.phone,
        reason: 'No active subscription'
      });
      continue;
    }

    // Check if paused on this date
    if (isPausedOnDate(sub.pausePeriods, date)) {
      skipped.push({
        customerId: customer._id,
        name: customer.name,
        phone: customer.phone,
        reason: 'Subscription paused on this date'
      });
      continue;
    }

    // Eligible — create notification
    const notification = await Notification.create({
      customerId: customer._id,
      customerName: customer.name,
      phone: customer.phone,
      message: `Delivery due for ${customer.name} (${customer.phone}) on ${dateStr}`,
      date: dateStr,
      type: 'delivery_due'
    });

    notified.push({
      customerId: customer._id,
      name: customer.name,
      phone: customer.phone,
      notificationId: notification._id,
      message: notification.message
    });
  }

  return {
    date: dateStr,
    isWeekday: true,
    notified,
    skipped,
    summary: {
      total: activeCustomers.length,
      notified: notified.length,
      skipped: skipped.length
    }
  };
}

/**
 * Get all notifications from the outbox, optionally filtered by date.
 *
 * @param {string|null} dateFilter - Optional YYYY-MM-DD string
 * @returns {Array} Notification documents
 */
async function getOutbox(dateFilter) {
  const query = {};
  if (dateFilter) {
    query.date = dateFilter;
  }
  return Notification.find(query).sort({ createdAt: -1 });
}

module.exports = {
  isPausedOnDate,
  generateDeliveryNotifications,
  getOutbox
};
