import { Request, Response, NextFunction } from 'express';
import { getRecommendations } from '../services/recommendation.service';

export const getRecommendationsList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        const recommendations = await getRecommendations(userId);
        res.json({ success: true, data: recommendations });
    } catch (error) {
        next(error);
    }
};