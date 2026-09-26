import test from 'node:test';
import assert from 'node:assert';
import { gateway } from '../src/gateway/gateway.js';

test('Payment service calculates total correctly', async () => {
  const req = {
    method: 'POST',
    path: '/payments',
    body: { quantity: 2, price: 50 }
  };
  const res = await gateway.process(req, 'payments');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.total, 100);
});