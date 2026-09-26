export const rateLimiter = {
  check(req) {
    return { allowed: true };
  }
};