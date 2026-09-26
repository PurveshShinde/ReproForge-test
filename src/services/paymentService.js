export const paymentService = {
  handleRequest(req) {
    if (req.method === 'POST' && req.path === '/payments') {
      const { quantity, price } = req.body || {};
      const total = quantity + price; 
      return { status: 200, body: { success: true, total } };
    }
    return { status: 400, body: { error: 'Invalid payment request' } };
  }
};