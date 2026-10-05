import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// ============================================================
// ЭТАЖИ (Floors)
// ============================================================
router.get('/floors', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const floors = await prisma.floor.findMany({
            where: { isPublished: true },
            include: { building: { select: { id: true, name: true } } },
            orderBy: { number: 'asc' }
        });
        res.json({ success: true, data: floors });
    } catch (error) { next(error); }
});

router.get('/floors/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const floor = await prisma.floor.findUnique({
            where: { id: Number(req.params.id), isPublished: true },
            include: { objects: { where: { isPublished: true } } }
        });
        if (!floor) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Этаж не найден' } });
        res.json({ success: true, data: floor });
    } catch (error) { next(error); }
});

// ============================================================
// ОБЪЕКТЫ И ПОМЕЩЕНИЯ (Objects / Rooms)
// ============================================================
router.get('/objects', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const where: any = { isPublished: true };
        if (req.query.typeFilter === 'room') {
            where.type = { in: ['classroom', 'laboratory', 'office'] };
        } else if (req.query.typeFilter === 'info') {
            where.type = { in: ['information', 'department', 'other'] };
        }
        if (req.query.floorId) where.floorId = Number(req.query.floorId);

        const objects = await prisma.spatialObject.findMany({ where, include: { floor: true, category: true } });
        res.json({ success: true, data: objects });
    } catch (error) { next(error); }
});

router.get('/objects/stats', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Упрощенная статистика для клиента
        const total = await prisma.spatialObject.count({ where: { isPublished: true } });
        const byType = await prisma.spatialObject.groupBy({
            by: ['type'],
            where: { isPublished: true },
            _count: { id: true }
        });
        res.json({ success: true, data: { total, byType } });
    } catch (error) { next(error); }
});

router.get('/objects/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const obj = await prisma.spatialObject.findUnique({
            where: { id: Number(req.params.id), isPublished: true },
            include: { floor: true, category: true, person: true }
        });
        if (!obj) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Объект не найден' } });
        res.json({ success: true, data: obj });
    } catch (error) { next(error); }
});

// Алиас для помещений
router.get('/rooms', (req, res, next) => { req.query.typeFilter = 'room'; next(); }, async (req: Request, res: Response, next: NextFunction) => {
    // Логика та же, что и в /objects, но с фильтром typeFilter='room'
    try {
        const objects = await prisma.spatialObject.findMany({
            where: { isPublished: true, type: { in: ['classroom', 'laboratory', 'office'] } },
            include: { floor: true }
        });
        res.json({ success: true, data: objects });
    } catch (error) { next(error); }
});

// ============================================================
// КАТЕГОРИИ
// ============================================================
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.category.findMany();
        res.json({ success: true, data: categories });
    } catch (error) { next(error); }
});

// ============================================================
// МАРШРУТЫ (Routes)
// ============================================================
router.post('/routes/calculate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Здесь должен быть вызов вашего сервиса маршрутизации
        // const result = await calculateRouteService(req.body);
        res.json({ success: true, data: { message: 'Маршрут построен (заглушка)', distance: 150, duration: 120 } });
    } catch (error) { next(error); }
});

export default router;