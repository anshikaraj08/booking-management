import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { getHalls, createHall, updateHall, deleteHall } from '../controllers/hall.controller.js';

// Public: list. Admin only: create / update / delete
const router = Router();

router.route('/').get(getHalls).post(authenticate, requireAdmin, createHall);
router.route('/:id').put(authenticate, requireAdmin, updateHall).delete(authenticate, requireAdmin, deleteHall);

export default router;
