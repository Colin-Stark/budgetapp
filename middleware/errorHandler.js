/**
 * Global error handling middleware
 * Sanitizes error messages to prevent leaking sensitive information
 */
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Send sanitized error response
  res.status(err.statusCode || 500).json({
    message: err.message || 'An unexpected error occurred',
    ...(isDevelopment && { stack: err.stack })
  });
};

module.exports = errorHandler;