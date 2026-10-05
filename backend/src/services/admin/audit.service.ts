import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAudit(
    userId: number,
    action: string,
    entity: string,
    entityId: number,
    details: any
) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entity,
                entityId,
                details: JSON.stringify(details)
            }
        });
    } catch (error) {
        console.error('Failed to write audit log:', error);
        // Не прерываем основной поток, если аудит не записался
    }
}