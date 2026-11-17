import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../controllers/menuItem.controller.js';

// Public: list. Admin only: create / update / delete
const router = Router();

router.route('/').get(getMenuItems).post(authenticate, requireAdmin, createMenuItem);
router.route('/:id').put(authenticate, requireAdmin, updateMenuItem).delete(authenticate, requireAdmin, deleteMenuItem);

export default router;
