export const userService = {
  handleRequest(req) {
    if (req.method === 'GET' && req.path === '/users') {
      return { status: 200, body: [{ id: 1, name: 'Alice' }] };
    }
    return { status: 404, body: { error: 'Not found' } };
  }
};