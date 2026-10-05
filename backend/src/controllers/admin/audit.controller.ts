import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { user: { select: { name: true, email: true } } }
        });
        res.json({ success: true, data: logs });
    } catch (error) { next(error); }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const log = await prisma.auditLog.findUnique({
            where: { id: Number(req.params.id) },
            include: { user: { select: { name: true, email: true } } }
        });
        res.json({ success: true, data: log });
    } catch (error) { next(error); }
};