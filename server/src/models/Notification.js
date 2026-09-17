const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: String, // YYYY-MM-DD format for easy querying
    required: true
  },
  type: {
    type: String,
    enum: ['delivery_due'],
    default: 'delivery_due'
  }
}, {
  timestamps: true
});

// Compound index for efficient querying and idempotency
notificationSchema.index({ date: 1, customerId: 1 }, { unique: true });
notificationSchema.index({ date: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
