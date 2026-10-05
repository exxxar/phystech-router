import { PrismaClient } from '@prisma/client';
import { validateGraph } from './graph.service';
import { invalidateGraphCache } from './graph-cache.service';

const prisma = new PrismaClient();

export async function publishModel(adminUserId: number) {
    // 1. Валидация графа перед публикацией
    const validation = await validateGraph();
    if (!validation.isValid) {
        throw new Error(`Опубликация невозможна: ${validation.errors.join('; ')}`);
    }

    // 2. Атомарная транзакция: публикуем всё и создаем версию
    const newVersion = `v${Date.now()}`;

    await prisma.$transaction(async (tx) => {
        await tx.floor.updateMany({ data: { isPublished: true } });
        await tx.spatialObject.updateMany({ data: { isPublished: true } });

        await tx.spatialModelVersion.create({
            data: {
                version: newVersion,
                status: 'published',
                createdBy: adminUserId,
                publishedAt: new Date(),
            },
        });
    });

    // 3. Инвалидация кэша
    await invalidateGraphCache();

    return { version: newVersion, publishedAt: new Date() };
}

export async function getPublicationStatus() {
    const latestVersion = await prisma.spatialModelVersion.findFirst({
        orderBy: { publishedAt: 'desc' },
    });

    return latestVersion
        ? { isPublished: true, version: latestVersion.version, publishedAt: latestVersion.publishedAt }
        : { isPublished: false, version: null, publishedAt: null };
}