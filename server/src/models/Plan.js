const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  mealType: {
    type: String,
    enum: ['lunch', 'dinner', 'both'],
    required: [true, 'Meal type is required']
  },
  items: [{
    type: String,
    trim: true
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Price must be positive']
  },
  duration: {
    type: String,
    enum: ['monthly'],
    default: 'monthly'
  },
  isVeg: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

planSchema.index({ isActive: 1 });
planSchema.index({ mealType: 1 });

module.exports = mongoose.model('Plan', planSchema);
