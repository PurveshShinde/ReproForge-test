import { userService } from '../services/userService.js';
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
};