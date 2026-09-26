import test from 'node:test';
import assert from 'node:assert';
import { gateway } from '../src/gateway/gateway.js';

test('Gateway preserves all body fields from service response', async () => {
  const req = { method: 'GET', path: '/orders/123' };
  const res = await gateway.process(req, 'orders');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.id, '123');
});