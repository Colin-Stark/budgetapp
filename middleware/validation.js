const { validationResult } = require('express-validator');

/**
 * Validation middleware
 * Checks for validation errors from express-validator
 * Returns a 400 error if validation fails
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg
            }))
        });
    }
    next();
};

module.exports = validate;