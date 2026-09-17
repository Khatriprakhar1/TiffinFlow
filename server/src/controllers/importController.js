/**
 * Import Controller
 * POST /api/import/customers — bulk import messy customer data
 */

const { processImport } = require('../services/importService');

// @desc    Import messy customer data
// @route   POST /api/import/customers
const importCustomers = async (req, res, next) => {
  try {
    const { customers } = req.body;

    if (!customers || !Array.isArray(customers)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain a "customers" array'
      });
    }

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customers array is empty'
      });
    }

    if (customers.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 500 records per import batch'
      });
    }

    const report = await processImport(customers);

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  importCustomers
};
