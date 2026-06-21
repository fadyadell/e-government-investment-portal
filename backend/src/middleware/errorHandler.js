/**
 * Global error handling middleware for Express
 */

const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  
  console.error(`[${timestamp}] ERROR:`, {
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Input validation failed',
        details,
      }
    });
  }

  // Mongoose cast error (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid ${err.path}: ${err.value}`,
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_KEY',
        message: 'A resource with this value already exists',
      }
    });
  }

  // Default server error
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: 'SERVER_ERROR',
      message: err.message || 'An unexpected error occurred',
    }
  });
};

// Request logging middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`);
  });
  next();
};

module.exports = { errorHandler, requestLogger };
