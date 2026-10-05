import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { logAudit } from '../../services/admin/audit.service';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany({
            include: { _count: { select: { objects: true } } }
        });
        res.json({ success: true, data: categories });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await prisma.category.findUnique({
            where: { id: Number(req.params.id) },
            include: { objects: { take: 10 } }
        });
        if (!category) {
            return res.status(404).json({
                success: false,
                error: { code: 'CATEGORY_NOT_FOUND', message: 'Категория не найдена' }
            });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Поле name обязательно' }
            });
        }

        const category = await prisma.category.create({
            data: { name, description }
        });

        const adminUserId = (req as any).user.id;
        await logAudit(adminUserId, 'CREATE_CATEGORY', 'Category', category.id, { name });

        res.status(201).json({ success: true, data: category });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                success: false,
                error: { code: 'CATEGORY_EXISTS', message: 'Категория с таким именем уже существует' }
            });
        }
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const { name, description } = req.body;

        const category = await prisma.category.update({
            where: { id },
            data: { name, description }
        });

        const adminUserId = (req as any).user.id;
        await logAudit(adminUserId, 'UPDATE_CATEGORY', 'Category', id, { name, description });

        res.json({ success: true, data: category });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'CATEGORY_NOT_FOUND', message: 'Категория не найдена' }
            });
        }
        next(error);
    }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);

        // Проверяем, есть ли объекты в этой категории
        const objectsCount = await prisma.spatialObject.count({ where: { categoryId: id } });
        if (objectsCount > 0) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'CATEGORY_IN_USE',
                    message: `Невозможно удалить категорию: в ней находится ${objectsCount} объектов`
                }
            });
        }

        await prisma.category.delete({ where: { id } });

        const adminUserId = (req as any).user.id;
        await logAudit(adminUserId, 'DELETE_CATEGORY', 'Category', id, {});

        res.json({ success: true, data: { message: 'Категория удалена' } });
    } catch (error) {
        next(error);
    }
};