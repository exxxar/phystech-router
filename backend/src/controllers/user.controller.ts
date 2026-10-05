import { Request, Response, NextFunction } from 'express';
import { getUserProfile, updateUserProfile } from '../services/user.service';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } });
        }

        const profile = await getUserProfile(userId);
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Не авторизован' } });
        }

        const profile = await updateUserProfile(userId, req.body);
        res.json({ success: true, data: profile });
    } catch (error) {
        next(error);
    }
};