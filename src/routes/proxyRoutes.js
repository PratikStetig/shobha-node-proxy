const { Router } = require('express');
const proxyController = require('../controllers/proxyController');

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Catch-all route to handle all HTTP methods for proxying
router.all('*', (req, res, next) => proxyController.handleProxy(req, res, next));

module.exports = router;