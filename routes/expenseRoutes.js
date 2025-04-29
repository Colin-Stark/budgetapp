const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validation');

// Input validation rules
const expenseValidationRules = [
    body('budget').isMongoId().withMessage('Valid budget ID is required'),
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('budgeted_amount').isNumeric().withMessage('Budgeted amount must be a number'),
    body('actual_amount').optional().isNumeric().withMessage('Actual amount must be a number'),
    body('priority_level').optional().isInt({ min: 1, max: 5 }).withMessage('Priority level must be between 1-5'),
    body('expected_date').optional().isISO8601().withMessage('Expected date must be a valid date'),
    body('paid').optional().isBoolean().withMessage('Paid must be a boolean'),
    body('paid_date').optional().isISO8601().withMessage('Paid date must be a valid date'),
    body('recurring').optional().isBoolean().withMessage('Recurring must be a boolean')
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

// GET all expenses (protected)
router.get('/', auth, async (req, res, next) => {
    try {
        // Filter expenses to only show those from budgets owned by the user
        const userBudgets = await Budget.find({ user: req.user.id });
        const budgetIds = userBudgets.map(budget => budget._id);
        const expenses = await Expense.find({ budget: { $in: budgetIds } });
        res.json(expenses);
    } catch (err) {
        next(err);
    }
});

// GET expenses by budget (protected)
router.get('/budget/:budgetId', auth, budgetIdValidation, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns this budget
        const isOwner = await userOwnsBudget(req.params.budgetId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access these expenses' });
        }

        const expenses = await Expense.find({ budget: req.params.budgetId });
        res.json(expenses);
    } catch (err) {
        next(err);
    }
});

// GET one expense (protected)
router.get('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        // Security check: Verify user owns the budget this expense belongs to
        const isOwner = await userOwnsBudget(expense.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access this expense' });
        }

        res.json(expense);
    } catch (err) {
        next(err);
    }
});

// CREATE an expense (protected)
router.post('/', auth, expenseValidationRules, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns the budget
        const isOwner = await userOwnsBudget(req.body.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to add expense to this budget' });
        }

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

        const newExpense = await expense.save();
        res.status(201).json(newExpense);
    } catch (err) {
        next(err);
    }
});

// UPDATE an expense (protected)
router.patch('/:id', auth, [...idValidation,
body('name').optional().isString().trim().notEmpty().withMessage('Name cannot be empty'),
body('budgeted_amount').optional().isNumeric().withMessage('Budgeted amount must be a number'),
body('actual_amount').optional().isNumeric().withMessage('Actual amount must be a number'),
body('priority_level').optional().isInt({ min: 1, max: 5 }).withMessage('Priority level must be between 1-5'),
body('expected_date').optional().isISO8601().withMessage('Expected date must be a valid date'),
body('paid').optional().isBoolean().withMessage('Paid must be a boolean'),
body('paid_date').optional().isISO8601().withMessage('Paid date must be a valid date'),
body('recurring').optional().isBoolean().withMessage('Recurring must be a boolean')
], validate, async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        // Security check: Verify user owns the budget this expense belongs to
        const isOwner = await userOwnsBudget(expense.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to update this expense' });
        }

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
        next(err);
    }
});

// DELETE an expense (protected)
router.delete('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        // Security check: Verify user owns the budget this expense belongs to
        const isOwner = await userOwnsBudget(expense.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this expense' });
        }

        await Expense.findByIdAndDelete(req.params.id);
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;