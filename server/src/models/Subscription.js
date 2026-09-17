const mongoose = require('mongoose');

const pausePeriodSchema = new mongoose.Schema({
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    default: null // null means currently paused (no end date yet)
  }
}, { _id: true });

const subscriptionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer ID is required'],
    unique: true
  },
  monthlyPrice: {
    type: Number,
    required: [true, 'Monthly price is required'],
    min: [1, 'Monthly price must be positive']
  },
  startDate: {
    type: Date,
    required: [true, 'Subscription start date is required']
  },
  pausePeriods: [pausePeriodSchema]
}, {
  timestamps: true
});


module.exports = mongoose.model('Subscription', subscriptionSchema);
