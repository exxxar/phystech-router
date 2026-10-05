import { Request, Response, NextFunction } from 'express';
import { getUserHistory, addToHistory } from '../services/history.service';

export const getHistoryList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } });
        }

        const history = await getUserHistory(userId);
        res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};

export const createHistoryEntry = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } });
        }

        const { objectId, action, metadata } = req.body;
        const entry = await addToHistory(userId, objectId, action, metadata);
        res.json({ success: true, data: entry });
    } catch (error) {
        next(error);
    }
};