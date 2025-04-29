const express = require('express');
const router = express.Router();
const Saving = require('../models/Saving');
const Budget = require('../models/Budget');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validation');

// Input validation rules
const savingValidationRules = [
    body('budget').isMongoId().withMessage('Valid budget ID is required'),
    body('target_amount').isNumeric().withMessage('Target amount must be a number'),
    body('saving_method').isString().trim().notEmpty().withMessage('Saving method is required'),
    body('actual_saved_amount').optional().isNumeric().withMessage('Actual saved amount must be a number'),
    body('notes').optional().isString().withMessage('Notes must be a string')
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

// GET all savings (protected)
router.get('/', auth, async (req, res, next) => {
    try {
        // Filter savings to only show those from budgets owned by the user
        const userBudgets = await Budget.find({ user: req.user.id });
        const budgetIds = userBudgets.map(budget => budget._id);
        const savings = await Saving.find({ budget: { $in: budgetIds } });
        res.json(savings);
    } catch (err) {
        next(err);
    }
});

// GET savings by budget (protected)
router.get('/budget/:budgetId', auth, budgetIdValidation, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns this budget
        const isOwner = await userOwnsBudget(req.params.budgetId, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access these savings' });
        }

        const savings = await Saving.find({ budget: req.params.budgetId });
        res.json(savings);
    } catch (err) {
        next(err);
    }
});

// GET one saving (protected)
router.get('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });

        // Security check: Verify user owns the budget this saving belongs to
        const isOwner = await userOwnsBudget(saving.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to access this saving' });
        }

        res.json(saving);
    } catch (err) {
        next(err);
    }
});

// CREATE a saving (protected)
router.post('/', auth, savingValidationRules, validate, async (req, res, next) => {
    try {
        // Security check: Verify user owns the budget
        const isOwner = await userOwnsBudget(req.body.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to add saving to this budget' });
        }

        const saving = new Saving({
            budget: req.body.budget,
            target_amount: req.body.target_amount,
            saving_method: req.body.saving_method,
            actual_saved_amount: req.body.actual_saved_amount,
            notes: req.body.notes
        });

        const newSaving = await saving.save();
        res.status(201).json(newSaving);
    } catch (err) {
        next(err);
    }
});

// UPDATE a saving (protected)
router.patch('/:id', auth, [...idValidation,
body('target_amount').optional().isNumeric().withMessage('Target amount must be a number'),
body('saving_method').optional().isString().trim().notEmpty().withMessage('Saving method cannot be empty'),
body('actual_saved_amount').optional().isNumeric().withMessage('Actual saved amount must be a number'),
body('notes').optional().isString().withMessage('Notes must be a string')
], validate, async (req, res, next) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });

        // Security check: Verify user owns the budget this saving belongs to
        const isOwner = await userOwnsBudget(saving.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to update this saving' });
        }

        if (req.body.target_amount) saving.target_amount = req.body.target_amount;
        if (req.body.saving_method) saving.saving_method = req.body.saving_method;
        if (req.body.actual_saved_amount !== undefined) saving.actual_saved_amount = req.body.actual_saved_amount;
        if (req.body.notes) saving.notes = req.body.notes;

        const updatedSaving = await saving.save();
        res.json(updatedSaving);
    } catch (err) {
        next(err);
    }
});

// DELETE a saving (protected)
router.delete('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const saving = await Saving.findById(req.params.id);
        if (!saving) return res.status(404).json({ message: 'Saving not found' });

        // Security check: Verify user owns the budget this saving belongs to
        const isOwner = await userOwnsBudget(saving.budget, req.user.id);
        if (!isOwner) {
            return res.status(403).json({ message: 'Not authorized to delete this saving' });
        }

        await Saving.findByIdAndDelete(req.params.id);
        res.json({ message: 'Saving deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;