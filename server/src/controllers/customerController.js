const Customer = require('../models/Customer');
const Subscription = require('../models/Subscription');

// @desc    Get all customers with search, pagination, sorting
// @route   GET /api/customers
const getCustomers = async (req, res, next) => {
  try {
    const {
      search = '',
      status,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Search by phone or name
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (status && ['active', 'paused'].includes(status)) {
      query.status = status;
    }

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const allowedSortFields = ['name', 'phone', 'planPrice', 'status', 'createdAt'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ [sortField]: sortOrder })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: customers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Create customer
// @route   POST /api/customers
const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, address, planPrice, planStartDate } = req.body;

    if (!name || !phone || !address || !planPrice || !planStartDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, phone, address, planPrice, and planStartDate'
      });
    }

    if (planPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Plan price must be positive'
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      address,
      planPrice,
      planStartDate
    });

    // Auto-create subscription for this customer
    await Subscription.create({
      customerId: customer._id,
      monthlyPrice: planPrice,
      startDate: planStartDate,
      pausePeriods: []
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
const updateCustomer = async (req, res, next) => {
  try {
    const { name, phone, address, planPrice } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    if (planPrice !== undefined && planPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Plan price must be positive'
      });
    }

    // Update fields
    if (name) customer.name = name;
    if (phone) customer.phone = phone;
    if (address) customer.address = address;
    if (planPrice) {
      customer.planPrice = planPrice;
      // Also update subscription price
      await Subscription.findOneAndUpdate(
        { customerId: customer._id },
        { monthlyPrice: planPrice }
      );
    }

    await customer.save();

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Delete associated subscription
    await Subscription.deleteOne({ customerId: customer._id });
    await Customer.deleteOne({ _id: customer._id });

    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard stats
// @route   GET /api/customers/stats
const getStats = async (req, res, next) => {
  try {
    const total = await Customer.countDocuments();
    const active = await Customer.countDocuments({ status: 'active' });
    const paused = await Customer.countDocuments({ status: 'paused' });

    // Estimated monthly revenue from active customers
    const revenueResult = await Customer.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, totalRevenue: { $sum: '$planPrice' } } }
    ]);
    const estimatedRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Recent 5 customers
    const recentCustomers = await Customer.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        total,
        active,
        paused,
        estimatedRevenue,
        recentCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getStats
};
