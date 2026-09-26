import { router } from './router.js';

export const server = {
  async handleRequest(req) {
    return router.route(req);
  }
};