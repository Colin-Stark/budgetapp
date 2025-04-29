const mongoose = require('mongoose');
const { Schema } = mongoose;

const incomeSchema = new Schema({
    budget: {
        type: Schema.Types.ObjectId,
        ref: 'Budget',
        required: true
    },
    type: String,
    amount: {
        type: Number,
        required: true
    },
    source: String,
    expected_date: Date,
    received_date: Date
});

const Income = mongoose.model('Income', incomeSchema);

module.exports = Income;