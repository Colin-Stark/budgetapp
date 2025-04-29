const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validation');

// Input validation rules
const budgetValidationRules = [
    body('user').isMongoId().withMessage('Valid user ID is required'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1-12'),
    body('year').isInt({ min: 2000 }).withMessage('Year must be valid')
];

const idValidation = [
    param('id').isMongoId().withMessage('Invalid ID format')
];

const userIdValidation = [
    param('userId').isMongoId().withMessage('Invalid user ID format')
];

// GET all budgets (protected)
router.get('/', auth, async (req, res, next) => {
    try {
        const budgets = await Budget.find();
        res.json(budgets);
    } catch (err) {
        next(err);
    }
});

// GET budgets by user (protected)
router.get('/user/:userId', auth, userIdValidation, validate, async (req, res, next) => {
    try {
        // Security check: Users can only view their own budgets unless they're an admin
        if (req.user.id !== req.params.userId) {
            return res.status(403).json({ message: 'Not authorized to access these budgets' });
        }

        const budgets = await Budget.find({ user: req.params.userId });
        res.json(budgets);
    } catch (err) {
        next(err);
    }
});

// GET one budget (protected)
router.get('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        // Security check: Users can only view their own budgets
        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to access this budget' });
        }

        res.json(budget);
    } catch (err) {
        next(err);
    }
});

// CREATE a budget (protected)
router.post('/', auth, budgetValidationRules, validate, async (req, res, next) => {
    try {
        // Security check: Users can only create budgets for themselves
        if (req.body.user !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to create budget for another user' });
        }

        const budget = new Budget({
            user: req.body.user,
            month: req.body.month,
            year: req.body.year
        });

        const newBudget = await budget.save();
        res.status(201).json(newBudget);
    } catch (err) {
        next(err);
    }
});

// UPDATE a budget (protected)
router.patch('/:id', auth, [...idValidation,
body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1-12'),
body('year').optional().isInt({ min: 2000 }).withMessage('Year must be valid')
], validate, async (req, res, next) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        // Security check: Users can only update their own budgets
        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this budget' });
        }

        if (req.body.month) budget.month = req.body.month;
        if (req.body.year) budget.year = req.body.year;

        const updatedBudget = await budget.save();
        res.json(updatedBudget);
    } catch (err) {
        next(err);
    }
});

// DELETE a budget (protected)
router.delete('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: 'Budget not found' });

        // Security check: Users can only delete their own budgets
        if (budget.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this budget' });
        }

        await Budget.findByIdAndDelete(req.params.id);
        res.json({ message: 'Budget deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;