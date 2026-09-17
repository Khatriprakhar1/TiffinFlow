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
  planPrice: {
    type: Number,
    required: [true, 'Plan price is required'],
    min: [1, 'Plan price must be positive']
  },
  planStartDate: {
    type: Date,
    required: [true, 'Plan start date is required']
  },
  status: {
    type: String,
    enum: ['active', 'paused'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
customerSchema.index({ phone: 1 });
customerSchema.index({ name: 'text' });
customerSchema.index({ status: 1 });

module.exports = mongoose.model('Customer', customerSchema);
