require('dotenv').config();
const createApp = require('./app');
const logger = require('./config/logger');

const PORT = process.env.PORT || 3030;
const app = createApp();

const server = app.listen(PORT, () => {
  logger.info(`Proxy server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  logger.info(`Received signal ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    logger.info('HTTP server closed successfully.');
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forceful shutdown due to timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection at Promise:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error);
  process.exit(1);
});