const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morganMiddleware = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const proxyRoutes = require('./routes/proxyRoutes');

const createApp = () => {
  const app = express();

  // Security & Core Middleware
  app.use(helmet());
  app.use(cors());
  app.use(morganMiddleware);
  
  // Use raw body parser for all requests so multipart streams and files aren't corrupted
  app.use(express.raw({ type: '*/*', limit: '50mb' }));

  // API Routes
  app.use('/', proxyRoutes);

  // Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
};

module.exports = createApp;