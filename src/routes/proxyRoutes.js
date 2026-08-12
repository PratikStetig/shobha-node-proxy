const { Router } = require('express');
const proxyController = require('../controllers/proxyController');

const router = Router();

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// Match all requests starting with /sf-api and delegate to controller
router.all('/*', (req, res, next) => proxyController.handleProxy(req, res, next));

module.exports = router;