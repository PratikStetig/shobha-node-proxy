const axios = require('axios');
const logger = require('../config/logger');

class ProxyService {
  constructor() {
    this.targetBaseUrl = process.env.TARGET_BASE_URL;
    if (!this.targetBaseUrl) {
      throw new Error('TARGET_BASE_URL is not defined in environment variables.');
    }

    this.client = axios.create({
      baseURL: this.targetBaseUrl,
      timeout: 60000, // Matching your Spring Boot timeout (60s)
    });
  }

  async forwardRequest(req) {
    try {
      const targetUrl = req.originalUrl;
      logger.info(`Forwarding ${req.method} request to ${this.targetBaseUrl}${targetUrl}`);

      // Extract and clean headers, keeping Content-Type (vital for multipart boundaries)
      const outgoingHeaders = {
        ...req.headers,
        host: new URL(this.targetBaseUrl).host,
      };

      // Remove unwanted headers that can cause upstream routing failures
      delete outgoingHeaders['connection'];
      delete outgoingHeaders['content-length']; // Axios will calculate the correct length for buffers

      const response = await this.client({
        method: req.method,
        url: targetUrl,
        headers: outgoingHeaders,
        data: req.body, // Buffer containing JSON, form-data, or multipart payload
        responseType: 'arraybuffer', // Ensures binary files/multipart responses aren't corrupted
        validateStatus: () => true, // Pass through upstream status codes
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