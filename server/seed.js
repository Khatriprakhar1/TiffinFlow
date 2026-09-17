const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Customer = require('./src/models/Customer');
const Subscription = require('./src/models/Subscription');
const Plan = require('./src/models/Plan');

const MONGODB_URI = process.env.MONGODB_URI;

const seed = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Customer.deleteMany({});
  await Subscription.deleteMany({});
  await Plan.deleteMany({});
  console.log('Cleared existing data');

  // 1. Create owner user (pre-save hook auto-hashes the password)
  const user = await User.create({
    name: 'Tiffin Owner',
    email: 'owner@tiffinflow.com',
    password: 'password123'
  });
  console.log(`Created user: ${user.email} (password: password123)`);

  // 2. Create plans
  const plans = await Plan.insertMany([
    { name: 'Basic Lunch', description: 'Simple home-style lunch with roti, sabzi, dal, rice', mealType: 'lunch', items: ['Roti', 'Sabzi', 'Dal', 'Rice'], price: 2500, isActive: true },
    { name: 'Premium Lunch', description: 'Premium lunch with extra items and dessert', mealType: 'lunch', items: ['Roti', 'Paneer Sabzi', 'Dal', 'Rice', 'Salad', 'Sweet'], price: 3500, isActive: true },
    { name: 'Lunch + Dinner Combo', description: 'Full day meals - lunch and dinner both included', mealType: 'both', items: ['Roti', 'Sabzi', 'Dal', 'Rice', 'Dinner Thali'], price: 4500, isActive: true },
    { name: 'Dinner Only', description: 'Light dinner with roti and sabzi', mealType: 'dinner', items: ['Roti', 'Sabzi', 'Dal'], price: 2000, isActive: true },
    { name: 'Weekend Special', description: 'Special weekend-only biryani plan', mealType: 'lunch', items: ['Biryani', 'Raita', 'Salad'], price: 1500, isActive: false }
  ]);
  console.log(`Created ${plans.length} plans`);

  // 3. Create customers with subscriptions
  const customersData = [
    { name: 'Rahul Sharma', phone: '9876543210', address: '42 MG Road, Jaipur', planPrice: 3000, planStartDate: '2026-09-01', status: 'active', planId: plans[0]._id },
    { name: 'Priya Patel', phone: '9876543211', address: '15 Station Road, Ahmedabad', planPrice: 3500, planStartDate: '2026-09-01', status: 'active', planId: plans[1]._id },
    { name: 'Amit Kumar', phone: '9876543212', address: '88 Lal Bagh, Bangalore', planPrice: 4500, planStartDate: '2026-08-15', status: 'active', planId: plans[2]._id },
    { name: 'Sneha Reddy', phone: '9876543213', address: '23 Banjara Hills, Hyderabad', planPrice: 2500, planStartDate: '2026-09-01', status: 'paused', planId: plans[0]._id },
    { name: 'Vikram Singh', phone: '9876543214', address: '7 Civil Lines, Delhi', planPrice: 3000, planStartDate: '2026-07-01', status: 'active' },
    { name: 'Ananya Desai', phone: '9876543215', address: '55 Marine Drive, Mumbai', planPrice: 4500, planStartDate: '2026-09-05', status: 'active', planId: plans[2]._id },
    { name: 'Rohan Gupta', phone: '9876543216', address: '12 Park Street, Kolkata', planPrice: 2000, planStartDate: '2026-09-01', status: 'active', planId: plans[3]._id },
    { name: 'Kavita Joshi', phone: '9876543217', address: '34 Mall Road, Shimla', planPrice: 3500, planStartDate: '2026-08-20', status: 'paused', planId: plans[1]._id },
    { name: 'Deepak Menon', phone: '9876543218', address: '99 MG Road, Kochi', planPrice: 3000, planStartDate: '2026-09-01', status: 'active' },
    { name: 'Meera Iyer', phone: '9876543219', address: '8 Anna Nagar, Chennai', planPrice: 2500, planStartDate: '2026-09-10', status: 'active', planId: plans[0]._id },
    { name: 'Arjun Nair', phone: '9876543220', address: '66 Residency Road, Trivandrum', planPrice: 0, status: 'inactive' },
    { name: 'Sanjay Verma', phone: '9876543221', address: '41 Hazratganj, Lucknow', planPrice: 0, status: 'inactive' }
  ];

  const customers = await Customer.insertMany(customersData);
  console.log(`Created ${customers.length} customers`);

  // 4. Create subscriptions for active/paused customers
  const subscriptions = [];
  for (const cust of customers) {
    if (cust.status === 'inactive') continue;

    const sub = {
      customerId: cust._id,
      monthlyPrice: cust.planPrice,
      startDate: cust.planStartDate,
      pausePeriods: []
    };

    // Add pause periods for paused customers
    if (cust.name === 'Sneha Reddy') {
      sub.pausePeriods = [{ startDate: new Date('2026-09-12'), endDate: null }];
    }
    if (cust.name === 'Kavita Joshi') {
      sub.pausePeriods = [
        { startDate: new Date('2026-09-01'), endDate: new Date('2026-09-05') },
        { startDate: new Date('2026-09-15'), endDate: null }
      ];
    }
    // Add a historical pause for Vikram (already resumed)
    if (cust.name === 'Vikram Singh') {
      sub.pausePeriods = [
        { startDate: new Date('2026-09-08'), endDate: new Date('2026-09-10') }
      ];
    }

    subscriptions.push(sub);
  }

  await Subscription.insertMany(subscriptions);
  console.log(`Created ${subscriptions.length} subscriptions`);

  // Summary
  console.log('\n========== SEED COMPLETE ==========');
  console.log(`Login:     owner@tiffinflow.com / password123`);
  console.log(`Plans:     ${plans.length}`);
  console.log(`Customers: ${customers.length} (${customers.filter(c => c.status === 'active').length} active, ${customers.filter(c => c.status === 'paused').length} paused, ${customers.filter(c => c.status === 'inactive').length} inactive)`);
  console.log(`Subscriptions: ${subscriptions.length}`);
  console.log('===================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
