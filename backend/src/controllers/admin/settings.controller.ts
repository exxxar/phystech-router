import { Request, Response, NextFunction } from 'express';
import { env } from '../../config/env';

// ============================================================
// ПОЛУЧИТЬ ОБЩИЕ НАСТРОЙКИ СИСТЕМЫ
// ============================================================
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Здесь можно вернуть настройки из БД или переменных окружения
        res.json({
            success: true,
            data: {
                appName: 'Интерактивный путеводитель по кафедре КТ',
                version: '1.0.0',
                maintenanceMode: false,
                defaultFloorId: 4, // Например, этаж кафедры по умолчанию
                mapRefreshInterval: 30000, // 30 секунд
            }
        });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// ПОЛУЧИТЬ ИНФОРМАЦИЮ О API
// ============================================================
export const getApiInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json({
            success: true,
            data: {
                version: '1.0.0',
                environment: process.env.NODE_ENV || 'development',
                databaseProvider: env.DB_PROVIDER || 'mysql',
                documentationUrl: '/api/docs',
                endpoints: {
                    auth: '/api/auth',
                    client: '/api/client',
                    admin: '/api/admin'
                }
            }
        });
    } catch (error) {
        next(error);
    }
};