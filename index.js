require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Budget = require('./models/Budget');
const Income = require('./models/Income');
const Expense = require('./models/Expense');
const Saving = require('./models/Saving');

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

// Export models
module.exports = {
    User,
    Budget,
    Income,
    Expense,
    Saving,
    mongoose
};