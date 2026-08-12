const axios = require('axios');
const logger = require('../config/logger');

class ProxyService {
  constructor() {
    this.targetBaseUrl = process.env.TARGET_BASE_URL;
    if (!this.targetBaseUrl) {
      throw new Error('TARGET_BASE_URL is not defined in environment variables.');
    }

    this.client = axios.create({
      baseURL: this.targetBaseUrl.replace(/\/$/, ''), // Remove trailing slash if present
      timeout: 60000,
    });
  }

  async forwardRequest(req) {
    try {
      // Strip /sf-api from the incoming request path to get the exact upstream path
      const originalPath = req.originalUrl.split('?')[0]; // path without query params
      const targetPath = originalPath.replace(/^\/sf-api/, '') || '/';
      
      const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
      const fullTargetUrl = queryString ? `${targetPath}?${queryString}` : targetPath;

      logger.info(`Forwarding ${req.method} request to target: ${this.client.defaults.baseURL}${fullTargetUrl}`);

      const outgoingHeaders = {
        ...req.headers,
        host: new URL(this.targetBaseUrl).host,
      };

      delete outgoingHeaders['connection'];
      delete outgoingHeaders['content-length'];

      const response = await this.client({
        method: req.method,
        url: fullTargetUrl,
        headers: outgoingHeaders,
        data: req.body, // Buffer containing multipart or JSON data
        responseType: 'arraybuffer',
        validateStatus: () => true,
      });

      return {
        status: response.status,
        headers: response.headers,
        data: response.data,
      };
    } catch (error) {
      logger.error(`Proxy forwarding failed: ${error.message}`, { stack: error.stack });
      const err = new Error('Bad Gateway / Upstream Service Unavailable');
      err.status = 502;
      throw err;
    }
  }
}

module.exports = new ProxyService();