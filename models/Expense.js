const mongoose = require('mongoose');
const { Schema } = mongoose;

const expenseSchema = new Schema({
    budget: {
        type: Schema.Types.ObjectId,
        ref: 'Budget',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    budgeted_amount: {
        type: Number,
        required: true
    },
    actual_amount: Number,
    priority_level: {
        type: String,
        enum: ['High', 'Medium', 'Low']
    },
    expected_date: Date,
    paid: {
        type: Boolean,
        default: false
    },
    paid_date: Date,
    recurring: {
        type: Boolean,
        default: false
    }
});

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;