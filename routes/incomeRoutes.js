const express = require('express');
const router = express.Router();
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validation');

// Input validation rules
const incomeValidationRules = [
    body('budget').isMongoId().withMessage('Valid budget ID is required'),
    body('type').isString().trim().notEmpty().withMessage('Type is required'),
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('source').isString().trim().notEmpty().withMessage('Source is required'),
    body('expected_date').optional().isISO8601().withMessage('Expected date must be a valid date'),
    body('received_date').optional().isISO8601().withMessage('Received date must be a valid date')
];

const idValidation = [
    param('id').isMongoId().withMessage('Invalid ID format')
];

const budgetIdValidation = [
    param('budgetId').isMongoId().withMessage('Invalid budget ID format')
];

// Helper function to check if user owns the budget
const userOwnsBudget = async (budgetId, userId) => {
    const budget = await Budget.findById(budgetId);
    return budget && budget.user.toString() === userId;
};

// GET all incomes (protected)
router.get('/', auth, async (req, res, next) => {
    try {
        // Filter incomes to only show those from budgets owned by the user
        const userBudgets = await Budget.find({ user: req.user.id });
        const budgetIds = userBudgets.map(budget => budget._id);
        const incomes = await Income.find({ budget: { $in: budgetIds } });
        res.json(incomes);
    } catch (err) {
        next(err);
    }
});

// GET incomes by budget (protected)
router.get('/budget/:budgetId', auth, budgetIdValidation, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns this budget
        const isOwner = await userOwnsBudget(req.params.budgetId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access these incomes' });
        }

        const incomes = await Income.find({ budget: req.params.budgetId });
        res.json(incomes);
    } catch (err) {
        next(err);
    }
});

// GET one income (protected)
router.get('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });

        // Security check: Verify user owns the budget this income belongs to
        const isOwner = await userOwnsBudget(income.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access this income' });
        }

        res.json(income);
    } catch (err) {
        next(err);
    }
});

// CREATE an income (protected)
router.post('/', auth, incomeValidationRules, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns the budget
        const isOwner = await userOwnsBudget(req.body.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to add income to this budget' });
        }

        const income = new Income({
            budget: req.body.budget,
            type: req.body.type,
            amount: req.body.amount,
            source: req.body.source,
            expected_date: req.body.expected_date,
            received_date: req.body.received_date
        });

        const newIncome = await income.save();
        res.status(201).json(newIncome);
    } catch (err) {
        next(err);
    }
});

// UPDATE an income (protected)
router.patch('/:id', auth, [...idValidation,
body('type').optional().isString().trim().notEmpty().withMessage('Type cannot be empty'),
body('amount').optional().isNumeric().withMessage('Amount must be a number'),
body('source').optional().isString().trim().notEmpty().withMessage('Source cannot be empty'),
body('expected_date').optional().isISO8601().withMessage('Expected date must be a valid date'),
body('received_date').optional().isISO8601().withMessage('Received date must be a valid date')
], validate, async (req, res, next) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });

        // Security check: Verify user owns the budget this income belongs to
        const isOwner = await userOwnsBudget(income.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to update this income' });
        }

        if (req.body.type) income.type = req.body.type;
        if (req.body.amount) income.amount = req.body.amount;
        if (req.body.source) income.source = req.body.source;
        if (req.body.expected_date) income.expected_date = req.body.expected_date;
        if (req.body.received_date) income.received_date = req.body.received_date;

        const updatedIncome = await income.save();
        res.json(updatedIncome);
    } catch (err) {
        next(err);
    }
});

// DELETE an income (protected)
router.delete('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: 'Income not found' });

        // Security check: Verify user owns the budget this income belongs to
        const isOwner = await userOwnsBudget(income.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this income' });
        }

        await Income.findByIdAndDelete(req.params.id);
        res.json({ message: 'Income deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;