export const orderService = {
  handleRequest(req) {
    if (req.method === 'GET' && req.path.startsWith('/orders/')) {
      const id = req.path.split('/')[2];
      return { status: 200, body: { id, status: 'shipped' } };
    }
    return { status: 404, body: { error: 'Not found' } };
  }
};