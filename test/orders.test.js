import test from 'node:test';
import assert from 'node:assert';
import { router } from '../src/router.js';

test('Router correctly routes to orders service', async () => {
  const req = { 
    method: 'GET', 
    path: '/orders/123', 
    headers: { authorization: 'Bearer test-token' } 
  };
  const res = await router.route(req);
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.status, 'shipped');
});