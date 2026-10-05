import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Требуется авторизация' }
        });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Доступ запрещен. Требуются права администратора' }
        });
    }

    next();
};