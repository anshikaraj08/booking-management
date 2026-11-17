import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/room.controller.js';

// Public: list. Admin only: create / update / delete
const router = Router();

router.route('/').get(getRooms).post(authenticate, requireAdmin, createRoom);
router.route('/:id').put(authenticate, requireAdmin, updateRoom).delete(authenticate, requireAdmin, deleteRoom);

export default router;
