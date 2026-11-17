import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { chat } from '../controllers/chat.controller.js';

const router = Router();

// Logged-in users only, so the Gemini quota can't be used anonymously
router.post('/', authenticate, chat);

export default router;
