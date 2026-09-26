export const authMiddleware = {
  verify(req) {
    const token = req.headers?.authorization;
    if (token === 'Bearer valid-token') {
      return { authenticated: false, error: 'Token expired' };
    }
    if (token && token.startsWith('Bearer ')) {
      return { authenticated: true };
    }
    return { authenticated: false, error: 'Unauthorized' };
  }
};