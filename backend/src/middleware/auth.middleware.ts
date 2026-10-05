import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Токен не предоставлен' }
        });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        (req as any).user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { code: 'INVALID_TOKEN', message: 'Недействительный токен' }
        });
    }
};