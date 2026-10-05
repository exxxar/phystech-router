import { Request, Response, NextFunction } from 'express';
import * as objectService from '../../services/admin/object.service';

// ============================================================
// СПИСОК ОБЪЕКТОВ
// ============================================================
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await objectService.getAdminObjects(req.query);
        res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error: any) {
        next(error);
    }
};

// ============================================================
// ОДИН ОБЪЕКТ
// ============================================================
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const object = await objectService.getAdminObjectById(id);
        res.json({ success: true, data: object });
    } catch (error: any) {
        if (error.message === 'OBJECT_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: { code: 'OBJECT_NOT_FOUND', message: 'Объект не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// СОЗДАТЬ ОБЪЕКТ
// ============================================================
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminUserId = (req as any).user.id;

        // Если роутер добавил type через middleware (для /rooms или /objects)
        if (req.body.type) {
            req.body.type = req.body.type;
        }

        const object = await objectService.createAdminObject(req.body, adminUserId);
        res.status(201).json({ success: true, data: object });
    } catch (error: any) {
        if (error.message === 'MISSING_REQUIRED_FIELDS') {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Отсутствуют обязательные поля: name, floorId, x, y' }
            });
        }
        if (error.message === 'FLOOR_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// ОБНОВИТЬ ОБЪЕКТ
// ============================================================
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;
        const object = await objectService.updateAdminObject(id, req.body, adminUserId);
        res.json({ success: true, data: object });
    } catch (error: any) {
        if (error.message === 'OBJECT_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: { code: 'OBJECT_NOT_FOUND', message: 'Объект не найден' }
            });
        }
        if (error.message === 'FLOOR_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// УДАЛИТЬ ОБЪЕКТ (Переименовано с delete в deleteObject)
// ============================================================
export const deleteObject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;
        const result = await objectService.deleteAdminObject(id, adminUserId);
        res.json({ success: true, data: result });
    } catch (error: any) {
        if (error.message === 'OBJECT_NOT_FOUND') {
            return res.status(404).json({
                success: false,
                error: { code: 'OBJECT_NOT_FOUND', message: 'Объект не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// СТАТИСТИКА ПО ОБЪЕКТАМ
// ============================================================
export const getStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stats = await objectService.getObjectsStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};