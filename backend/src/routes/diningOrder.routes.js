import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getDiningOrders,
  createDiningOrder,
  updateDiningOrder
} from '../controllers/diningOrder.controller.js';

const router = Router();

router.use(authenticate);

router.route('/').get(getDiningOrders).post(createDiningOrder);
router.put('/:id', requireAdmin, updateDiningOrder);

export default router;
