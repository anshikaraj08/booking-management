import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getFeedbacks, createFeedback } from '../controllers/feedback.controller.js';

const router = Router();

// GET: guests see their own feedback, admins see all
router.route('/').get(authenticate, getFeedbacks).post(createFeedback);

export default router;
