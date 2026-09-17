/**
 * Transfer Controller
 * Handles subscription transfers between customers with split billing.
 */

const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');
const TransferLog = require('../models/TransferLog');
const { calculateSplitBill } = require('../services/billingService');

// @desc    Transfer subscription from one customer to another
// @route   POST /api/subscriptions/transfer
const transferSubscription = async (req, res, next) => {
  try {
    const { fromCustomerId, toCustomerId, transferDate, notes } = req.body;

    // Validate inputs
    if (!fromCustomerId || !toCustomerId || !transferDate) {
      return res.status(400).json({
        success: false,
        message: 'fromCustomerId, toCustomerId, and transferDate are required'
      });
    }

    if (fromCustomerId === toCustomerId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot transfer to the same customer'
      });
    }

    const tDate = new Date(transferDate);
    tDate.setHours(0, 0, 0, 0);

    // Find both customers
    const fromCustomer = await Customer.findById(fromCustomerId);
    if (!fromCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Source customer not found'
      });
    }

    const toCustomer = await Customer.findById(toCustomerId);
    if (!toCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Target customer not found'
      });
    }

    // Find source subscription
    const subscription = await Subscription.findOne({ customerId: fromCustomerId });
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Source customer has no subscription to transfer'
      });
    }

    // Check if target already has a subscription
    const existingSub = await Subscription.findOne({ customerId: toCustomerId });
    if (existingSub) {
      return res.status(400).json({
        success: false,
        message: 'Target customer already has an active subscription. Delete it first or choose another customer.'
      });
    }

    // Close any open pause on source subscription
    const openPause = subscription.pausePeriods.find(p => p.endDate === null);
    if (openPause) {
      openPause.endDate = new Date(tDate);
    }

    // Create transfer log
    const transferLog = await TransferLog.create({
      subscriptionId: subscription._id,
      fromCustomerId: fromCustomer._id,
      toCustomerId: toCustomer._id,
      transferDate: tDate,
      planId: fromCustomer.planId,
      monthlyPrice: subscription.monthlyPrice,
      notes: notes || ''
    });

    // Reassign subscription to target customer
    subscription.customerId = toCustomer._id;
    await subscription.save();

    // Update target customer with plan info
    toCustomer.planId = fromCustomer.planId;
    toCustomer.planPrice = subscription.monthlyPrice;
    toCustomer.planStartDate = subscription.startDate;
    toCustomer.status = 'active';
    await toCustomer.save();

    // Update source customer — they no longer have an active sub
    fromCustomer.status = 'active'; // Reset to active (no longer paused either)
    await fromCustomer.save();

    res.json({
      success: true,
      message: 'Subscription transferred successfully',
      data: {
        transferLog,
        subscription,
        fromCustomer: { id: fromCustomer._id, name: fromCustomer.name },
        toCustomer: { id: toCustomer._id, name: toCustomer.name }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transfer history logs
// @route   GET /api/transfers
const getTransferLogs = async (req, res, next) => {
  try {
    const logs = await TransferLog.find()
      .populate('fromCustomerId', 'name phone')
      .populate('toCustomerId', 'name phone')
      .populate('planId', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

// @desc    Get split bill for a transferred subscription
// @route   GET /api/subscriptions/:customerId/split-bill?month=2026-09
const getSplitBill = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: 'Provide month in YYYY-MM format'
      });
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr);
    const monthNum = parseInt(monthStr);

    const monthStart = new Date(year, monthNum - 1, 1);
    const monthEnd = new Date(year, monthNum, 0);

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Find transfers involving this customer in this month
    const transfersFrom = await TransferLog.find({
      fromCustomerId: customerId,
      transferDate: { $gte: monthStart, $lte: monthEnd }
    }).populate('toCustomerId', 'name phone');

    const transfersTo = await TransferLog.find({
      toCustomerId: customerId,
      transferDate: { $gte: monthStart, $lte: monthEnd }
    }).populate('fromCustomerId', 'name phone');

    // Determine active range for this customer
    // Default: full month
    let activeFrom = new Date(monthStart);
    let activeTo = new Date(monthEnd);

    // If transferred OUT, they were active from month start to transfer date - 1
    if (transfersFrom.length > 0) {
      const transferOutDate = new Date(transfersFrom[0].transferDate);
      transferOutDate.setDate(transferOutDate.getDate() - 1); // last day they were served
      activeTo = transferOutDate;
    }

    // If transferred IN, they were active from transfer date to month end
    if (transfersTo.length > 0) {
      activeFrom = new Date(transfersTo[0].transferDate);
    }

    // Get subscription (may belong to this customer or may have been transferred)
    const subscription = await Subscription.findOne({ customerId });

    // Determine price — use transfer log price or subscription
    const price = transfersTo.length > 0
      ? transfersTo[0].monthlyPrice
      : (subscription ? subscription.monthlyPrice : customer.planPrice);

    const pausePeriods = subscription ? subscription.pausePeriods : [];

    const bill = calculateSplitBill(price, year, monthNum, pausePeriods, {
      from: activeFrom,
      to: activeTo
    });

    res.json({
      success: true,
      data: {
        customer: { name: customer.name, phone: customer.phone },
        billing: bill,
        transfers: {
          transferredOut: transfersFrom,
          transferredIn: transfersTo
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  transferSubscription,
  getTransferLogs,
  getSplitBill
};
