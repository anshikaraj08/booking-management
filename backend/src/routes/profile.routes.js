import { Router } from 'express';
import { authenticate, requireAdmin } from '../middleware/auth.middleware.js';
import {
  getProfiles,
  getProfileById,
  createProfile,
  upsertProfileByEmail
} from '../controllers/profile.controller.js';

// All profile routes need a login. Guests are limited to their own profile
// inside the controller; admins can access any profile.
const router = Router();

router.use(authenticate);

router.route('/').get(getProfiles).post(requireAdmin, createProfile);
router.get('/id/:id', getProfileById);
router.put('/:email', upsertProfileByEmail);

export default router;
