import { Router } from 'express';
import authRoutes from './auth.routes.js';
import newsletterRoutes from './newsletter.routes.js';
import roomRoutes from './room.routes.js';
import hallRoutes from './hall.routes.js';
import menuItemRoutes from './menuItem.routes.js';
import bookingRoutes from './booking.routes.js';
import profileRoutes from './profile.routes.js';
import diningOrderRoutes from './diningOrder.routes.js';
import feedbackRoutes from './feedback.routes.js';
import chatRoutes from './chat.routes.js';
import { testEmail } from '../controllers/newsletter.controller.js';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';

// Mounted at /api in app.js
const router = Router();

router.use('/auth', authRoutes);
router.use('/newsletter', newsletterRoutes);
router.post('/test-email', authenticate, requireAdmin, testEmail);
router.use('/chat', chatRoutes);
router.use('/rooms', roomRoutes);
router.use('/halls', hallRoutes);
router.use('/menu-items', menuItemRoutes);
router.use('/bookings', bookingRoutes);
router.use('/profiles', profileRoutes);
router.use('/dining-orders', diningOrderRoutes);
router.use('/feedbacks', feedbackRoutes);

export default router;
