const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');

// GET all expenses
router.get('/', async (req, res) => {
    try {
        const expenses = await Expense.find();
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET expenses by budget
router.get('/budget/:budgetId', async (req, res) => {
    try {
        const expenses = await Expense.find({ budget: req.params.budgetId });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET one expense
router.get('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// CREATE an expense
router.post('/', async (req, res) => {
    const expense = new Expense({
        budget: req.body.budget,
        name: req.body.name,
        budgeted_amount: req.body.budgeted_amount,
        actual_amount: req.body.actual_amount,
        priority_level: req.body.priority_level,
        expected_date: req.body.expected_date,
        paid: req.body.paid,
        paid_date: req.body.paid_date,
        recurring: req.body.recurring
    });

    try {
        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// UPDATE an expense
router.patch('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        if (req.body.name) expense.name = req.body.name;
        if (req.body.budgeted_amount) expense.budgeted_amount = req.body.budgeted_amount;
        if (req.body.actual_amount !== undefined) expense.actual_amount = req.body.actual_amount;
        if (req.body.priority_level) expense.priority_level = req.body.priority_level;
        if (req.body.expected_date) expense.expected_date = req.body.expected_date;
        if (req.body.paid !== undefined) expense.paid = req.body.paid;
        if (req.body.paid_date) expense.paid_date = req.body.paid_date;
        if (req.body.recurring !== undefined) expense.recurring = req.body.recurring;

        const updatedExpense = await expense.save();
        res.json(updatedExpense);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an expense
router.delete('/:id', async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;