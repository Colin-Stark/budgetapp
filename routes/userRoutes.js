const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const { body, param } = require('express-validator');
const validate = require('../middleware/validation');
const jwt = require('jsonwebtoken');

// Input validation rules
const userValidationRules = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const idValidation = [
    param('id').isMongoId().withMessage('Invalid ID format')
];

// GET all users (protected)
router.get('/', auth, async (req, res, next) => {
    try {
        const users = await User.find().select('-password'); // Exclude password field
        res.json(users);
    } catch (err) {
        next(err);
    }
});

// GET one user (protected)
router.get('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        next(err);
    }
});

// User login with JWT token generation
router.post('/login', [
    body('email').isEmail().withMessage('Must be a valid email address'),
    body('password').notEmpty().withMessage('Password is required')
], validate, async (req, res, next) => {
    try {
        // Find user by email
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        // Check password
        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
            { expiresIn: '24h' }
        );

        // Create response without password
        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
    } catch (err) {
        next(err);
    }
});

// CREATE a user with validation
router.post('/', userValidationRules, validate, async (req, res, next) => {
    try {
        // Check if email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        const user = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        });

        const newUser = await user.save();
        // Don't send back password in response
        const userResponse = newUser.toObject();
        delete userResponse.password;

        // Generate JWT token for new user
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_production',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            user: userResponse,
            token
        });
    } catch (err) {
        next(err);
    }
});

// UPDATE a user (protected)
router.patch('/:id', auth, [...idValidation,
body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
body('email').optional().isEmail().withMessage('Must be a valid email address'),
body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, async (req, res, next) => {
    try {
        // Check if user has permission to update this user
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to update this user' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.name) user.name = req.body.name;
        if (req.body.email) user.email = req.body.email;
        if (req.body.password) user.password = req.body.password;

        const updatedUser = await user.save();
        // Don't send back password in response
        const userResponse = updatedUser.toObject();
        delete userResponse.password;
        res.json(userResponse);
    } catch (err) {
        next(err);
    }
});

// DELETE a user (protected)
router.delete('/:id', auth, idValidation, validate, async (req, res, next) => {
    try {
        // Check if user has permission to delete this user
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ message: 'Not authorized to delete this user' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;