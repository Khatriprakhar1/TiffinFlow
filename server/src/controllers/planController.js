const Plan = require('../models/Plan');

// @desc    Get all plans (public - no auth needed for browsing)
// @route   GET /api/plans
const getPlans = async (req, res, next) => {
  try {
    const { mealType, isVeg, activeOnly } = req.query;
    const query = {};

    // By default, public requests only see active plans
    if (activeOnly !== 'false') {
      query.isActive = true;
    }

    if (mealType && ['lunch', 'dinner', 'both'].includes(mealType)) {
      query.mealType = mealType;
    }

    if (isVeg !== undefined) {
      query.isVeg = isVeg === 'true';
    }

    const plans = await Plan.find(query).sort({ price: 1 });

    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single plan
// @route   GET /api/plans/:id
const getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Create plan
// @route   POST /api/plans
const createPlan = async (req, res, next) => {
  try {
    const { name, description, mealType, items, price, isVeg } = req.body;

    if (!name || !description || !mealType || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, mealType, and price'
      });
    }

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be positive'
      });
    }

    const plan = await Plan.create({
      name,
      description,
      mealType,
      items: items || [],
      price,
      isVeg: isVeg !== undefined ? isVeg : true
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    const { name, description, mealType, items, price, isVeg, isActive } = req.body;

    if (price !== undefined && price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be positive'
      });
    }

    if (name) plan.name = name;
    if (description) plan.description = description;
    if (mealType) plan.mealType = mealType;
    if (items) plan.items = items;
    if (price) plan.price = price;
    if (isVeg !== undefined) plan.isVeg = isVeg;
    if (isActive !== undefined) plan.isActive = isActive;

    await plan.save();

    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plan (soft delete - sets isActive to false)
// @route   DELETE /api/plans/:id
const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found' });
    }

    plan.isActive = false;
    await plan.save();

    res.json({ success: true, message: 'Plan deactivated' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPlans, getPlan, createPlan, updatePlan, deletePlan };
