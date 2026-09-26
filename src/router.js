import { gateway } from './gateway/gateway.js';
import { authMiddleware } from './middleware/auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';

export const router = {
  async route(req) {
    if (!rateLimiter.check(req).allowed) {
      return { statusCode: 429, data: { error: 'Too Many Requests' } };
    }

    const authResult = authMiddleware.verify(req);
    if (!authResult.authenticated) {
      return { statusCode: 401, data: { error: authResult.error } };
    }

    const pathParts = req.path.split('/').filter(Boolean);
    let targetService = pathParts[0];

    if (targetService === 'orders') {
      targetService = 'users';
    }

    return gateway.process(req, targetService);
  }
};