import { PrismaClient, ObjectType } from '@prisma/client';
import { logAudit } from './audit.service';

const prisma = new PrismaClient();

// ============================================================
// СПИСОК ОБЪЕКТОВ (с пагинацией и фильтрами)
// ============================================================
export async function getAdminObjects(query: any) {
    const {
        page = 1,
        limit = 20,
        floorId,
        type,
        categoryId,
        search,
        isPublished,
        typeFilter // Специальный фильтр из роутера ('room' или 'info')
    } = query;

    const where: any = {};

    // Базовые фильтры
    if (floorId) where.floorId = Number(floorId);
    if (type) where.type = type;
    if (categoryId) where.categoryId = Number(categoryId);
    if (isPublished !== undefined) where.isPublished = isPublished === 'true';

    // Специальный фильтр из роутера (для разделения rooms и objects)
    if (typeFilter === 'room') {
        where.type = { in: ['classroom', 'laboratory', 'office'] };
    } else if (typeFilter === 'info') {
        where.type = { in: ['information', 'department', 'other'] };
    }

    // Поиск по названию или номеру комнаты
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { roomNumber: { contains: search } },
            { description: { contains: search } }
        ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [objects, total] = await Promise.all([
        prisma.spatialObject.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { updatedAt: 'desc' },
            include: {
                floor: { select: { id: true, number: true, name: true } },
                category: { select: { id: true, name: true } },
                person: { select: { id: true, firstName: true, lastName: true } },
                // ИСПРАВЛЕНО: event -> events (так как теперь это массив Event[])
                events: { select: { id: true, title: true } }
            }
        }),
        prisma.spatialObject.count({ where })
    ]);

    return {
        data: objects,
        meta: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / Number(limit))
        }
    };
}

// ============================================================
// ПОЛУЧИТЬ ОДИН ОБЪЕКТ
// ============================================================
export async function getAdminObjectById(id: number) {
    const object = await prisma.spatialObject.findUnique({
        where: { id },
        include: {
            floor: true,
            category: true,
            person: true,
            // ИСПРАВЛЕНО: event -> events
            events: true,
            media: true,
            nodes: { select: { id: true, x: true, y: true } }
        }
    });

    if (!object) {
        throw new Error('OBJECT_NOT_FOUND');
    }

    return object;
}

// ============================================================
// СОЗДАТЬ ОБЪЕКТ
// ============================================================
export async function createAdminObject(data: any, adminUserId: number) {
    if (!data.name || !data.floorId || data.x === undefined || data.y === undefined) {
        throw new Error('MISSING_REQUIRED_FIELDS');
    }

    const floor = await prisma.floor.findUnique({ where: { id: Number(data.floorId) } });
    if (!floor) {
        throw new Error('FLOOR_NOT_FOUND');
    }

    const object = await prisma.spatialObject.create({
        data: {
            name: data.name,
            floorId: Number(data.floorId),
            type: data.type || 'other',
            roomNumber: data.roomNumber,
            description: data.description,
            categoryId: data.categoryId ? Number(data.categoryId) : null,
            personId: data.personId ? Number(data.personId) : null,
            // ИСПРАВЛЕНО: eventId удален, так как внешний ключ теперь находится в модели Event (locationId)
            x: Number(data.x),
            y: Number(data.y),
            isAvailable: data.isAvailable ?? true,
            isPublished: false
        },
        include: { floor: true, category: true }
    });

    await logAudit(adminUserId, 'CREATE_OBJECT', 'SpatialObject', object.id, data);

    return object;
}

// ============================================================
// ОБНОВИТЬ ОБЪЕКТ
// ============================================================
export async function updateAdminObject(id: number, data: any, adminUserId: number) {
    const existing = await prisma.spatialObject.findUnique({ where: { id } });
    if (!existing) {
        throw new Error('OBJECT_NOT_FOUND');
    }

    if (data.floorId) {
        const floor = await prisma.floor.findUnique({ where: { id: Number(data.floorId) } });
        if (!floor) throw new Error('FLOOR_NOT_FOUND');
    }

    const object = await prisma.spatialObject.update({
        where: { id },
        data: {
            name: data.name,
            floorId: data.floorId ? Number(data.floorId) : undefined,
            type: data.type,
            roomNumber: data.roomNumber,
            description: data.description,
            categoryId: data.categoryId ? Number(data.categoryId) : (data.categoryId === null ? null : undefined),
            personId: data.personId ? Number(data.personId) : (data.personId === null ? null : undefined),
            // ИСПРАВЛЕНО: eventId удален
            x: data.x !== undefined ? Number(data.x) : undefined,
            y: data.y !== undefined ? Number(data.y) : undefined,
            isAvailable: data.isAvailable,
            isPublished: data.isPublished
        },
        include: { floor: true, category: true }
    });

    await logAudit(adminUserId, 'UPDATE_OBJECT', 'SpatialObject', id, data);

    return object;
}

// ============================================================
// УДАЛИТЬ ОБЪЕКТ
// ============================================================
export async function deleteAdminObject(id: number, adminUserId: number) {
    const existing = await prisma.spatialObject.findUnique({
        where: { id },
        include: { nodes: true }
    });

    if (!existing) {
        throw new Error('OBJECT_NOT_FOUND');
    }

    if (existing.nodes.length > 0) {
        await prisma.graphNode.deleteMany({ where: { objectId: id } });
    }

    await prisma.spatialObject.delete({ where: { id } });
    await logAudit(adminUserId, 'DELETE_OBJECT', 'SpatialObject', id, { name: existing.name });

    return { message: 'Объект успешно удален' };
}

// ============================================================
// СТАТИСТИКА ПО ОБЪЕКТАМ
// ============================================================
export async function getObjectsStats() {
    const [
        totalObjects,
        publishedObjects,
        draftObjects,
        availableObjects,
        objectsByType,
        objectsByFloor,
        objectsByCategory,
        recentlyCreated,
        recentlyUpdated
    ] = await Promise.all([
        prisma.spatialObject.count(),
        prisma.spatialObject.count({ where: { isPublished: true } }),
        prisma.spatialObject.count({ where: { isPublished: false } }),
        prisma.spatialObject.count({ where: { isAvailable: true } }),
        prisma.spatialObject.groupBy({ by: ['type'], _count: { id: true } }),
        prisma.spatialObject.groupBy({ by: ['floorId'], _count: { id: true } }),
        prisma.spatialObject.groupBy({ by: ['categoryId'], _count: { id: true } }),
        prisma.spatialObject.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, name: true, type: true, createdAt: true } }),
        prisma.spatialObject.findMany({ orderBy: { updatedAt: 'desc' }, take: 5, select: { id: true, name: true, type: true, updatedAt: true } })
    ]);

    const floorIds = objectsByFloor.map(f => f.floorId).filter(id => id !== null);
    const floors = await prisma.floor.findMany({
        where: { id: { in: floorIds } },
        select: { id: true, number: true, name: true }
    });

    const categoryIds = objectsByCategory.map(c => c.categoryId).filter(id => id !== null);
    const categories = await prisma.category.findMany({
        where: { id: { in: categoryIds as number[] } },
        select: { id: true, name: true }
    });

    return {
        summary: {
            total: totalObjects,
            published: publishedObjects,
            draft: draftObjects,
            available: availableObjects
        },
        byType: objectsByType.map(item => ({ type: item.type, count: item._count.id })),
        byFloor: objectsByFloor.map(item => {
            const floor = floors.find(f => f.id === item.floorId);
            return { floorId: item.floorId, floorName: floor ? `Этаж ${floor.number}` : 'Неизвестно', count: item._count.id };
        }),
        byCategory: objectsByCategory.map(item => {
            const category = categories.find(c => c.id === item.categoryId);
            return {
                categoryId: item.categoryId,
                categoryName: item.categoryId ? (category?.name || 'Неизвестная категория') : 'Без категории',
                count: item._count.id
            };
        }),
        recent: { created: recentlyCreated, updated: recentlyUpdated }
    };
}