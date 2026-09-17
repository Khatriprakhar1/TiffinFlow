const express = require('express');
const {
  createSubscription,
  getSubscription,
  pauseSubscription,
  resumeSubscription,
  getBill
} = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected
router.use(protect);

router.post('/:customerId', createSubscription);
router.get('/:customerId', getSubscription);
router.post('/:customerId/pause', pauseSubscription);
router.post('/:customerId/resume', resumeSubscription);
router.get('/:customerId/bill', getBill);

module.exports = router;
