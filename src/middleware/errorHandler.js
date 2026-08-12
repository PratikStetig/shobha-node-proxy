const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(`${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`, {
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: statusCode,
      message: process.env.NODE_ENV === 'production' && statusCode === 500 ? 'Internal Server Error' : message,
    },
  });
};

module.exports = errorHandler;