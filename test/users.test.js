import test from 'node:test';
import assert from 'node:assert';
import { userService } from '../src/services/userService.js';

test('Users service returns users list', () => {
  const req = { method: 'GET', path: '/users' };
  const res = userService.handleRequest(req);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body[0].name, 'Alice');
});