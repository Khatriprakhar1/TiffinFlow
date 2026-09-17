const express = require('express');
const {
  transferSubscription,
  getTransferLogs,
  getSplitBill
} = require('../controllers/transferController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes protected
router.use(protect);

router.post('/subscriptions/transfer', transferSubscription);
router.get('/transfers', getTransferLogs);
router.get('/subscriptions/:customerId/split-bill', getSplitBill);

module.exports = router;
