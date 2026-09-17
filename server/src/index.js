const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api', require('./routes/transferRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/plans', require('./routes/planRoutes'));
app.use('/api', require('./routes/clockRoutes'));
app.use('/api/import', require('./routes/importRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'TiffinFlow API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TiffinFlow server running on port ${PORT}`);
});

module.exports = app;
