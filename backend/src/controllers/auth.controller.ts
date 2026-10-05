import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password, role } = req.body;
        const result = await registerUser({ name, email, password, role });

        res.status(201).json({
            success: true,
            data: result, // { token, user }
        });
    } catch (error: any) {
        // Если это наша кастомная ошибка из сервиса
        if (error.message.includes('уже существует')) {
            return res.status(409).json({
                success: false,
                error: { code: 'EMAIL_EXISTS', message: error.message }
            });
        }
        next(error);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const result = await loginUser(email, password);

        res.json({
            success: true,
            data: result, // { token, user }
        });
    } catch (error: any) {
        if (error.message.includes('Неверный')) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: error.message }
            });
        }
        next(error);
    }
};