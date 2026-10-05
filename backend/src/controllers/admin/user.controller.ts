import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { logAudit } from '../../services/admin/audit.service';

const prisma = new PrismaClient();

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(req.params.id) },
            include: { profile: true }
        });
        if (!user) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminUserId = (req as any).user.id;
        const hash = await bcrypt.hash(req.body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role || 'student',
                passwordHash: hash
            }
        });

        await logAudit(adminUserId, 'CREATE_USER', 'User', user.id, { email: user.email, role: user.role });

        res.status(201).json({ success: true, data: user });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email уже занят' } });
        }
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;
        const { password, ...rest } = req.body; // Исключаем пароль из обычного обновления

        const user = await prisma.user.update({ where: { id }, data: rest });

        await logAudit(adminUserId, 'UPDATE_USER', 'User', id, rest);

        res.json({ success: true, data: user });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }
        next(error);
    }
};

// !!! ПЕРЕИМЕНОВАНО с 'delete' на 'deleteUser' !!!
export const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;

        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }

        await prisma.user.delete({ where: { id } });

        await logAudit(adminUserId, 'DELETE_USER', 'User', id, { email: user.email });

        res.json({ success: true, data: { message: 'Пользователь успешно удален' } });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }
        next(error);
    }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Пароль должен быть не менее 6 символов' } });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({ where: { id }, data: { passwordHash: hash } });

        await logAudit(adminUserId, 'RESET_PASSWORD', 'User', id, {});

        res.json({ success: true, data: { message: 'Пароль успешно изменен' } });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }
        next(error);
    }
};

export const updateRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const adminUserId = (req as any).user.id;
        const { role } = req.body;

        const validRoles = ['student', 'teacher', 'employee', 'applicant', 'guest', 'admin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Недопустимая роль' } });
        }

        const user = await prisma.user.update({ where: { id }, data: { role } });

        await logAudit(adminUserId, 'UPDATE_ROLE', 'User', id, { role });

        res.json({ success: true, data: user });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'Пользователь не найден' } });
        }
        next(error);
    }
};