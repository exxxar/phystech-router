import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getObjects(query: any) {
    const { page = 1, limit = 20, floorId, type, category, search } = query;

    const where: any = { status: 'published' };

    if (floorId) where.floorId = parseInt(floorId);
    if (type) where.type = type;
    if (category) where.category = category;
    if (search) {
        where.OR = [
            { name: { contains: search } },
            { roomNumber: { contains: search } }
        ];
    }

    const [objects, total] = await Promise.all([
        prisma.spatialObject.findMany({
            where,
            skip: (page - 1) * limit,
            take: limit,
            include: { floor: true }
        }),
        prisma.spatialObject.count({ where })
    ]);

    return {
        data: objects,
        meta: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}

export async function getObjectById(id: number) {
    const object = await prisma.spatialObject.findUnique({
        where: { id },
        include: { floor: true }
    });

    if (!object) throw new Error('Object not found');
    return object;
}