const express = require('express');
const {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan
} = require('../controllers/planController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes (no auth needed for browsing menu)
router.get('/', getPlans);
router.get('/:id', getPlan);

// Protected routes (owner only)
router.post('/', protect, createPlan);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

module.exports = router;
