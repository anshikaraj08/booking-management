import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking
} from '../controllers/booking.controller.js';

const router = Router();

router.use(authenticate);

router.route('/').get(getBookings).post(createBooking);
router.route('/:id').put(requireAdmin, updateBooking).delete(requireAdmin, deleteBooking);

export default router;
