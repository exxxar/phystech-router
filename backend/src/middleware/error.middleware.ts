import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: { code: 'VALIDATION_ERROR', message: 'Ошибка валидации', details: err.errors }
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            success: false,
            error: { code: 'UNAUTHORIZED', message: 'Неавторизованный доступ' }
        });
    }

    res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_SERVER_ERROR', message: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message }
    });
};