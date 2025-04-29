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

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Initialize express app
const app = express();
app.use(express.json()); // For parsing application/json

// Add security headers
app.use((req, res, next) => {
    // HTTP security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Define the port
const PORT = process.env.PORT || 3000;

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');

        // Use routes after DB connection
        app.use('/api/users', userRoutes);
        app.use('/api/budgets', budgetRoutes);
        app.use('/api/incomes', incomeRoutes);
        app.use('/api/expenses', expenseRoutes);
        app.use('/api/savings', savingRoutes);

        // Global error handler - must be after all routes
        app.use(errorHandler);

        // Handle 404 errors for undefined routes
        app.use((req, res) => {
            res.status(404).json({ message: 'Resource not found' });
        });

        // Start the server only after DB connection is established
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => console.error('Could not connect to MongoDB', err));

// Export models for external use
module.exports = {
    User,
    Budget,
    Income,
    Expense,
    Saving,
    mongoose
};