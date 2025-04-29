const mongoose = require('mongoose');
const { Schema } = mongoose;

const budgetSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;