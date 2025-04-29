const mongoose = require('mongoose');
const { Schema } = mongoose;

const savingSchema = new Schema({
    budget: {
        type: Schema.Types.ObjectId,
        ref: 'Budget',
        required: true
    },
    target_amount: {
        type: Number,
        required: true
    },
    saving_method: String,
    actual_saved_amount: Number,
    notes: String
});

const Saving = mongoose.model('Saving', savingSchema);

module.exports = Saving;