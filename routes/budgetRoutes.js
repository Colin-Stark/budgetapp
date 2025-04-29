const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// GET all budgets
router.get('/', async (req, res) => {
    try {
        const budgets = await Budget.find();
        res.json(budgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET budgets by user
router.get('/user/:userId', async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.params.userId });
        res.json(budgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one budget
router.get('/:id', async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });
        res.json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE a budget
router.post('/', async (req, res) => {
    const budget = new Budget({
        user: req.body.user,
        month: req.body.month,
        year: req.body.year
    });

    try {
        const newBudget = await budget.save();
        res.status(201).json(newBudget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE a budget
router.patch('/:id', async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        if (req.body.month) budget.month = req.body.month;
        if (req.body.year) budget.year = req.body.year;

        const updatedBudget = await budget.save();
        res.json(updatedBudget);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE a budget
router.delete('/:id', async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        await Budget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;