import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getFloors() {
    return await prisma.floor.findMany({
        include: {
            building: true,
            objects: {
                where: { status: 'published' },
                take: 10
            }
        }
    });
}

export async function getFloorById(id: number) {
    const floor = await prisma.floor.findUnique({
        where: { id },
        include: {
            building: true,
            objects: { where: { status: 'published' } }
        }
    });

    if (!floor) throw new Error('Floor not found');
    return floor;
}


export async function getClientFloors() {
    return prisma.floor.findMany({
        where: { isPublished: true }, // Клиент видит только опубликованное
        include: { objects: { where: { isPublished: true } } }
    });
}

// --- Методы для Админа (полный доступ + CRUD) ---
export async function getAdminFloors() {
    return prisma.floor.findMany({
        include: { objects: true } // Админ видит всё, включая черновики
    });
}

export async function createFloor(data: any, adminUserId: number) {
    const floor = await prisma.floor.create({ data });
    await logAudit(adminUserId, 'CREATE_FLOOR', 'Floor', floor.id, data);
    return floor;
}

export async function updateFloor(id: number, data: any, adminUserId: number) {
    const floor = await prisma.floor.update({ where: { id }, data });
    await logAudit(adminUserId, 'UPDATE_FLOOR', 'Floor', id, data);
    return floor;
}

// --- Вспомогательная функция для Журнала изменений (Audit) ---
async function logAudit(userId: number, action: string, entity: string, entityId: number, details: any) {
    await prisma.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            details: JSON.stringify(details)
        }
    });
}