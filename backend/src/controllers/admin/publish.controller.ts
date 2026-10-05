import { Request, Response, NextFunction } from 'express';
import { publishModel, getPublicationStatus } from '../../services/admin/publish.service';

export const publish = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminUserId = (req as any).user.id;
        const result = await publishModel(adminUserId);

        res.json({ success: true, data: result });
    } catch (error: any) {
        // Специальная обработка ошибки валидации
        if (error.message.includes('Опубликация невозможна')) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_FAILED', message: error.message }
            });
        }
        next(error);
    }
};

export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const status = await getPublicationStatus();
        res.json({ success: true, data: status });
    } catch (error) {
        next(error);
    }
};