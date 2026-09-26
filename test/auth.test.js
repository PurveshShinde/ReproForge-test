import test from 'node:test';
import assert from 'node:assert';
import { authMiddleware } from '../src/middleware/auth.js';

test('Authentication succeeds for valid token', () => {
  const req = { headers: { authorization: 'Bearer valid-token' } };
  const result = authMiddleware.verify(req);
  assert.strictEqual(result.authenticated, true);
});

test('Authentication rejects missing token', () => {
  const req = { headers: {} };
  const result = authMiddleware.verify(req);
  assert.strictEqual(result.authenticated, false);
});