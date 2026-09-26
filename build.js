import fs from 'fs';
import { execSync } from 'child_process';

const exec = (cmd) => {
  console.log('>', cmd);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Command failed: ${cmd}`);
  }
};

const dirs = ['src', 'test', 'middleware', 'gateway', 'services'];
dirs.forEach(d => {
    if (fs.existsSync(d)) fs.rmSync(d, { recursive: true, force: true });
});
if (fs.existsSync('.git')) fs.rmSync('.git', { recursive: true, force: true });

exec('git init');
exec('git branch -M main');
exec('git config user.name "Test Bot"');
exec('git config user.email "bot@example.com"');

fs.writeFileSync('package.json', JSON.stringify({
  name: "reproforge-gateway",
  type: "module",
  scripts: {
    test: "node --test"
  }
}, null, 2));

fs.writeFileSync('README.md', `# API Gateway\n\nA lightweight API gateway designed for test environments.\n\n## Architecture\n- \`src/server.js\`: Entry point\n- \`src/router.js\`: Request routing\n- \`src/middleware/\`: Auth and rate limiting\n- \`src/gateway/\`: Core request processing and transformation\n- \`src/services/\`: Domain logic\n\n## Running Tests\nRun \`npm test\` to execute the test suite.\n`);

exec('git add .');
exec('git commit -m "initial gateway architecture"');

fs.mkdirSync('src/services', { recursive: true });
fs.mkdirSync('src/gateway', { recursive: true });

fs.writeFileSync('src/services/userService.js', `export const userService = {
  handleRequest(req) {
    if (req.method === 'GET' && req.path === '/users') {
      return { status: 200, body: [{ id: 1, name: 'Alice' }] };
    }
    return { status: 404, body: { error: 'Not found' } };
  }
};`);

fs.writeFileSync('src/services/orderService.js', `export const orderService = {
  handleRequest(req) {
    if (req.method === 'GET' && req.path.startsWith('/orders/')) {
      const id = req.path.split('/')[2];
      return { status: 200, body: { id, status: 'shipped' } };
    }
    return { status: 404, body: { error: 'Not found' } };
  }
};`);

fs.writeFileSync('src/services/paymentService.js', `export const paymentService = {
  handleRequest(req) {
    if (req.method === 'POST' && req.path === '/payments') {
      const { quantity, price } = req.body || {};
      const total = quantity * price; 
      return { status: 200, body: { success: true, total } };
    }
    return { status: 400, body: { error: 'Invalid payment request' } };
  }
};`);

fs.writeFileSync('src/gateway/serviceRegistry.js', `import { userService } from '../services/userService.js';
import { orderService } from '../services/orderService.js';
import { paymentService } from '../services/paymentService.js';

export const serviceRegistry = {
  getService(serviceName) {
    switch (serviceName) {
      case 'users': return userService;
      case 'orders': return orderService;
      case 'payments': return paymentService;
      default: return null;
    }
  }
};`);

fs.writeFileSync('src/gateway/responseTransformer.js', `export const responseTransformer = {
  transform(response) {
    if (!response || !response.body) {
      return { statusCode: 500, data: { error: 'Internal Server Error' } };
    }
    const data = JSON.parse(JSON.stringify(response.body));
    return {
      statusCode: response.status,
      data: data
    };
  }
};`);

fs.writeFileSync('src/gateway/gateway.js', `import { serviceRegistry } from './serviceRegistry.js';
import { responseTransformer } from './responseTransformer.js';

export const gateway = {
  async process(req, serviceName) {
    const service = serviceRegistry.getService(serviceName);
    if (!service) {
      return { statusCode: 404, data: { error: 'Service not found' } };
    }
    try {
      const response = await service.handleRequest(req);
      return responseTransformer.transform(response);
    } catch (err) {
      return { statusCode: 500, data: { error: err.message } };
    }
  }
};`);

fs.writeFileSync('src/server.js', `import { router } from './router.js';

export const server = {
  async handleRequest(req) {
    return router.route(req);
  }
};`);

exec('git add src/');
exec('git commit -m "add services"');

fs.mkdirSync('src/middleware', { recursive: true });
fs.writeFileSync('src/middleware/rateLimiter.js', `export const rateLimiter = {
  check(req) {
    return { allowed: true };
  }
};`);

fs.writeFileSync('src/middleware/auth.js', `export const authMiddleware = {
  verify(req) {
    const token = req.headers?.authorization;
    if (token === 'Bearer valid-token') {
      return { authenticated: true };
    }
    if (token && token.startsWith('Bearer ')) {
      return { authenticated: true };
    }
    return { authenticated: false, error: 'Unauthorized' };
  }
};`);

fs.writeFileSync('src/router.js', `import { gateway } from './gateway/gateway.js';
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

    return gateway.process(req, targetService);
  }
};`);

exec('git add src/');
exec('git commit -m "add authentication"');

fs.mkdirSync('test', { recursive: true });

fs.writeFileSync('test/auth.test.js', `import test from 'node:test';
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
});`);

fs.writeFileSync('test/users.test.js', `import test from 'node:test';
import assert from 'node:assert';
import { userService } from '../src/services/userService.js';

test('Users service returns users list', () => {
  const req = { method: 'GET', path: '/users' };
  const res = userService.handleRequest(req);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.body[0].name, 'Alice');
});`);

fs.writeFileSync('test/orders.test.js', `import test from 'node:test';
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
});`);

fs.writeFileSync('test/payments.test.js', `import test from 'node:test';
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
});`);

fs.writeFileSync('test/gateway.test.js', `import test from 'node:test';
import assert from 'node:assert';
import { gateway } from '../src/gateway/gateway.js';

test('Gateway preserves all body fields from service response', async () => {
  const req = { method: 'GET', path: '/orders/123' };
  const res = await gateway.process(req, 'orders');
  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.data.id, '123');
});`);

exec('git add test/');
exec('git commit -m "add tests"');

fs.writeFileSync('src/router.js', `import { gateway } from './gateway/gateway.js';
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
};`);
exec('git add src/router.js');
exec('git commit -m "refactor routing mechanism"');

fs.writeFileSync('src/services/paymentService.js', `export const paymentService = {
  handleRequest(req) {
    if (req.method === 'POST' && req.path === '/payments') {
      const { quantity, price } = req.body || {};
      const total = quantity + price; 
      return { status: 200, body: { success: true, total } };
    }
    return { status: 400, body: { error: 'Invalid payment request' } };
  }
};`);
exec('git add src/services/paymentService.js');
exec('git commit -m "update payment calculation logic"');

fs.writeFileSync('src/gateway/responseTransformer.js', `export const responseTransformer = {
  transform(response) {
    if (!response || !response.body) {
      return { statusCode: 500, data: { error: 'Internal Server Error' } };
    }
    const data = JSON.parse(JSON.stringify(response.body));
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        delete data.id; 
    }
    return {
      statusCode: response.status,
      data: data
    };
  }
};`);
exec('git add src/gateway/responseTransformer.js');
exec('git commit -m "standardize response transformation"');

fs.writeFileSync('src/middleware/auth.js', `export const authMiddleware = {
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
};`);
exec('git add src/middleware/auth.js');
exec('git commit -m "enhance token validation"');
