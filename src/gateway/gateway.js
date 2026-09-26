import { serviceRegistry } from './serviceRegistry.js';
import { responseTransformer } from './responseTransformer.js';

export const gateway = {
  async process(req, serviceName) {
    const service = serviceRegistry.getService(serviceName);
    if (!service) {
      return { statusCode: 404, data: { error: 'Service not found' } };
    }
    try {
      const response = await service.handleRequest(req);
      return responseTransformer.transform(response);
    } catch (err) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }
};