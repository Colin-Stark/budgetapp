require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const Budget = require('./models/Budget');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Saving = require('./models/Saving');

// Import routes
const userRoutes = require('./routes/userRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const savingRoutes = require('./routes/savingRoutes');

// Initialize express app
const app = express();
app.use(express.json()); // For parsing application/json

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/savings', savingRoutes);

// Define the port
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export models for external use
module.exports = {
    User,
    Budget,
    Income,
    Expense,
    Saving,
    mongoose
};