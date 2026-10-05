import { Router } from 'express';
import authRoutes from './auth.routes';
import clientRoutes from './client.routes'; // <-- Этот импорт теперь точно сработает
import adminRoutes from './admin.routes';
import userRoutes from './user.routes';
import { requireAdmin } from '../middleware/role.middleware';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/client', clientRoutes); // <-- Префикс /client
router.use('/user', userRoutes);
router.use('/admin', authMiddleware, requireAdmin, adminRoutes);

export default router;