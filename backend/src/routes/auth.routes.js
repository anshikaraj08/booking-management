import { Router } from 'express';
import {
  register,
  login,
  getSecurityQuestion,
  verifySecurityAnswer,
  resetPassword
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password/question', getSecurityQuestion);
router.post('/forgot-password/verify', verifySecurityAnswer);
router.post('/forgot-password/reset', resetPassword);

export default router;
