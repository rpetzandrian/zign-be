import { Router } from 'express';
import { getProfile } from './user.controller';
import { authMiddleware } from 'src/middleware/auth_middleware';

const router = Router();

router.get('/profile', authMiddleware, getProfile);

export default router;