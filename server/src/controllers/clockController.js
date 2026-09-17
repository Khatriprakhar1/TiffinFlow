/**
 * Clock Controller
 * POST /api/clock  — trigger daily notification generation
 * GET  /api/outbox — read notification outbox
 */

const { generateDeliveryNotifications, getOutbox } = require('../services/notificationService');

// @desc    Trigger clock — generate delivery notifications for today (or a given date)
// @route   POST /api/clock
const triggerClock = async (req, res, next) => {
  try {
    const { date } = req.body; // Optional: YYYY-MM-DD for testing
    const result = await generateDeliveryNotifications(date || new Date());

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get notification outbox
// @route   GET /api/outbox
const getOutboxHandler = async (req, res, next) => {
  try {
    const { date } = req.query; // Optional: YYYY-MM-DD filter

    const notifications = await getOutbox(date || null);

    res.json({
      success: true,
      data: {
        count: notifications.length,
        date: date || 'all',
        notifications
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerClock,
  getOutboxHandler
};
