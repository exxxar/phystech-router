import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../services/admin/audit.service';

const prisma = new PrismaClient();

// ============================================================
// ПОЛУЧИТЬ ВСЕ ЭТАЖИ
// ============================================================
export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const floors = await prisma.floor.findMany({
            include: {
                building: { select: { id: true, name: true } },
                _count: { select: { objects: true } }
            },
            orderBy: { number: 'asc' }
        });
        res.json({ success: true, data: floors });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// ПОЛУЧИТЬ ОДИН ЭТАЖ
// ============================================================
export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const floor = await prisma.floor.findUnique({
            where: { id },
            include: {
                building: true,
                objects: true
            }
        });

        if (!floor) {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        res.json({ success: true, data: floor });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// СОЗДАТЬ ЭТАЖ
// ============================================================
export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminUserId = (req as any).user.id;
        const floor = await prisma.floor.create({ data: req.body });

        await logAudit(adminUserId, 'CREATE_FLOOR', 'Floor', floor.id, req.body);

        res.status(201).json({ success: true, data: floor });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// ОБНОВИТЬ ЭТАЖ
// ============================================================
export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;

        const floor = await prisma.floor.update({
            where: { id },
            data: req.body
        });

        await logAudit(adminUserId, 'UPDATE_FLOOR', 'Floor', id, req.body);

        res.json({ success: true, data: floor });
    } catch (error: any) {
        if (error.code === 'P2025') { // Prisma error for record not found
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// УДАЛИТЬ ЭТАЖ (Переименовано, чтобы избежать ключевого слова delete)
// ============================================================
export const deleteFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;

        // В реальном проекте здесь стоит проверить, есть ли на этаже объекты,
        // и запретить удаление или удалить их каскадно.
        await prisma.floor.delete({ where: { id } });

        await logAudit(adminUserId, 'DELETE_FLOOR', 'Floor', id, {});

        res.json({ success: true, data: { message: 'Этаж успешно удален' } });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// ЗАГРУЗИТЬ ПЛАН ЭТАЖА
// ============================================================
export const uploadPlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;

        // Примечание: Чтобы req.file работал, на этот роут в admin.routes.ts
        // нужно повесить middleware multer: upload.single('plan')
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: { code: 'NO_FILE', message: 'Файл плана не был загружен' }
            });
        }

        // Формируем путь к файлу (в реальности здесь может быть логика загрузки в S3/Cloud)
        const fileUrl = `/uploads/floors/${req.file.filename}`;

        const floor = await prisma.floor.update({
            where: { id },
            data: { planUrl: fileUrl }
        });

        await logAudit(adminUserId, 'UPLOAD_PLAN', 'Floor', id, { fileUrl });

        res.json({ success: true, data: floor });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};

// ============================================================
// УДАЛИТЬ ПЛАН ЭТАЖА
// ============================================================
export const deletePlan = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;

        const floor = await prisma.floor.update({
            where: { id },
            data: { planUrl: null }
        });

        await logAudit(adminUserId, 'DELETE_PLAN', 'Floor', id, {});

        res.json({ success: true, data: floor });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'FLOOR_NOT_FOUND', message: 'Этаж не найден' }
            });
        }
        next(error);
    }
};