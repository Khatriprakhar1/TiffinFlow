const Subscription = require('../models/Subscription');
const Customer = require('../models/Customer');
const { calculateBill } = require('../services/billingService');

// @desc    Create subscription for customer
// @route   POST /api/subscriptions/:customerId
const createSubscription = async (req, res, next) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if subscription already exists
    const existing = await Subscription.findOne({ customerId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Subscription already exists for this customer'
      });
    }

    const subscription = await Subscription.create({
      customerId,
      monthlyPrice: req.body.monthlyPrice || customer.planPrice,
      startDate: req.body.startDate || customer.planStartDate,
      pausePeriods: []
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get subscription for customer
// @route   GET /api/subscriptions/:customerId
const getSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      customerId: req.params.customerId
    }).populate('customerId', 'name phone status');

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Pause subscription
// @route   POST /api/subscriptions/:customerId/pause
const pauseSubscription = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.status === 'paused') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already paused'
      });
    }

    const subscription = await Subscription.findOne({
      customerId: req.params.customerId
    });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Add new pause period with no end date
    const pauseStartDate = req.body.startDate ? new Date(req.body.startDate) : new Date();
    subscription.pausePeriods.push({
      startDate: pauseStartDate,
      endDate: null
    });
    await subscription.save();

    // Update customer status
    customer.status = 'paused';
    await customer.save();

    res.json({
      success: true,
      message: 'Subscription paused',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resume subscription
// @route   POST /api/subscriptions/:customerId/resume
const resumeSubscription = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (customer.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already active'
      });
    }

    const subscription = await Subscription.findOne({
      customerId: req.params.customerId
    });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Find the open pause period (endDate is null) and set endDate
    const openPause = subscription.pausePeriods.find(p => p.endDate === null);
    if (openPause) {
      openPause.endDate = req.body.endDate ? new Date(req.body.endDate) : new Date();
    }
    await subscription.save();

    // Update customer status
    customer.status = 'active';
    await customer.save();

    res.json({
      success: true,
      message: 'Subscription resumed',
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bill for customer for a given month
// @route   GET /api/subscriptions/:customerId/bill?month=2026-09
const getBill = async (req, res, next) => {
  try {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month in YYYY-MM format (e.g. 2026-09)'
      });
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Invalid month. Must be between 01 and 12'
      });
    }

    const customer = await Customer.findById(req.params.customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const subscription = await Subscription.findOne({
      customerId: req.params.customerId
    });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const bill = calculateBill(
      subscription.monthlyPrice,
      year,
      monthNum,
      subscription.pausePeriods
    );

    res.json({
      success: true,
      data: {
        customer: {
          name: customer.name,
          phone: customer.phone
        },
        billing: bill
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscription,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  getBill
};
