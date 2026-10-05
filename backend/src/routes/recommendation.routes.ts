import { Router } from 'express';
import { getRecommendationsList } from '../controllers/recommendation.controller';

const router = Router();

router.get('/', getRecommendationsList);

export default router;