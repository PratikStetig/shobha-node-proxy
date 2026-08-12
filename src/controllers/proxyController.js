const proxyService = require('../services/proxyService');

class ProxyController {
  async handleProxy(req, res, next) {
    try {
      const upstreamResponse = await proxyService.forwardRequest(req);

      // Forward safe response headers back to client
      Object.entries(upstreamResponse.headers).forEach(([key, value]) => {
        if (!['transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      res.status(upstreamResponse.status).send(upstreamResponse.data);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ProxyController();