import { Router } from 'express';
import { getHistoryList, createHistoryEntry } from '../controllers/history.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getHistoryList);
router.post('/', authMiddleware, createHistoryEntry);

export default router;