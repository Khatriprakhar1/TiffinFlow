const express = require('express');
const { triggerClock, getOutboxHandler } = require('../controllers/clockController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/clock', triggerClock);
router.get('/outbox', getOutboxHandler);

module.exports = router;
