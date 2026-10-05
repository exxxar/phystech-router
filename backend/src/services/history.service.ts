import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUserHistory(userId: number) {
    return await prisma.userHistory.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { object: true }
    });
}

export async function addToHistory(userId: number, objectId: number, action: string, metadata?: any) {
    return await prisma.userHistory.create({
        data: {
            userId,
            objectId,
            action,
            metadata: metadata ? JSON.stringify(metadata) : null
        }
    });
}