const express = require('express');
const router = express.Router();
const Saving = require('../models/Saving');

// GET all savings
router.get('/', async (req, res) => {
    try {
        const savings = await Saving.find();
        res.json(savings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET savings by budget
router.get('/budget/:budgetId', async (req, res) => {
    try {
        const savings = await Saving.find({ budget: req.params.budgetId });
        res.json(savings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one saving
router.get('/:id', async (req, res) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });
        res.json(saving);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a saving
router.post('/', async (req, res) => {
    const saving = new Saving({
        budget: req.body.budget,
        target_amount: req.body.target_amount,
        saving_method: req.body.saving_method,
        actual_saved_amount: req.body.actual_saved_amount,
        notes: req.body.notes
    });

    try {
        const newSaving = await saving.save();
        res.status(201).json(newSaving);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a saving
router.patch('/:id', async (req, res) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });

        if (req.body.target_amount) saving.target_amount = req.body.target_amount;
        if (req.body.saving_method) saving.saving_method = req.body.saving_method;
        if (req.body.actual_saved_amount !== undefined) saving.actual_saved_amount = req.body.actual_saved_amount;
        if (req.body.notes) saving.notes = req.body.notes;

        const updatedSaving = await saving.save();
        res.json(updatedSaving);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a saving
router.delete('/:id', async (req, res) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });

        await Saving.findByIdAndDelete(req.params.id);
        res.json({ message: 'Saving deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;