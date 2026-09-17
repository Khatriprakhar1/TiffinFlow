const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    trim: true,
    match: [/^\d{10}$/, 'Phone number must be 10 digits']
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: false // Optional for backward compatibility with existing customers
  },
  planPrice: {
    type: Number,
    required: false,
    min: [0, 'Plan price cannot be negative'],
    default: 0
  },
  planStartDate: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'inactive'],
    default: 'inactive'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
customerSchema.index({ name: 'text' });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
