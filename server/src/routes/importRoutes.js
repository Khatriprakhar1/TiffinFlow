const express = require('express');
const { importCustomers } = require('../controllers/importController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Protected routes
router.use(protect);

router.post('/customers', importCustomers);

module.exports = router;
