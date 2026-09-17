const mongoose = require('mongoose');

const transferLogSchema = new mongoose.Schema({
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  fromCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  toCustomerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  transferDate: {
    type: Date,
    required: [true, 'Transfer date is required']
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  monthlyPrice: {
    type: Number,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

transferLogSchema.index({ subscriptionId: 1 });
transferLogSchema.index({ fromCustomerId: 1 });
transferLogSchema.index({ toCustomerId: 1 });
transferLogSchema.index({ transferDate: 1 });

module.exports = mongoose.model('TransferLog', transferLogSchema);
