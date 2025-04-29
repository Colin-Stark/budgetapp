const express = require('express');
const router = express.Router();
const Income = require('../models/Income');

// GET all incomes
router.get('/', async (req, res) => {
    try {
        const incomes = await Income.find();
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET incomes by budget
router.get('/budget/:budgetId', async (req, res) => {
    try {
        const incomes = await Income.find({ budget: req.params.budgetId });
        res.json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one income
router.get('/:id', async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });
        res.json(income);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE an income
router.post('/', async (req, res) => {
    const income = new Income({
        budget: req.body.budget,
        type: req.body.type,
        amount: req.body.amount,
        source: req.body.source,
        expected_date: req.body.expected_date,
        received_date: req.body.received_date
    });

    try {
        const newIncome = await income.save();
        res.status(201).json(newIncome);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE an income
router.patch('/:id', async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });

        if (req.body.type) income.type = req.body.type;
        if (req.body.amount) income.amount = req.body.amount;
        if (req.body.source) income.source = req.body.source;
        if (req.body.expected_date) income.expected_date = req.body.expected_date;
        if (req.body.received_date) income.received_date = req.body.received_date;

        const updatedIncome = await income.save();
        res.json(updatedIncome);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an income
router.delete('/:id', async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });

        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: 'Income deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;