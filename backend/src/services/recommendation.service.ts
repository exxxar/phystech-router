import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

export async function getRecommendations(userId?: number) {
    let userInterests: string[] = [];
    let viewedObjectIds: number[] = [];

    if (userId) {
        const profile = await prisma.userProfile.findUnique({ where: { userId } });
        if (profile?.interests) {
            userInterests = JSON.parse(profile.interests as string);
        }

        const history = await prisma.userHistory.findMany({
            where: { userId },
            select: { objectId: true }
        });
        viewedObjectIds = history.map(h => h.objectId);
    }

    // Простой rule-based алгоритм
    const allObjects = await prisma.spatialObject.findMany({
        where: {
            status: 'published',
            id: { notIn: viewedObjectIds }
        }
    });

    const scored = allObjects.map(obj => {
        let score = 0;

        // InterestMatch
        if (userInterests.length > 0 && obj.category && userInterests.includes(obj.category)) {
            score += env.RECOMMENDATION_INTEREST_WEIGHT;
        }

        // Proximity (заглушка)
        score += env.RECOMMENDATION_PROXIMITY_WEIGHT * 0.5;

        return { ...obj, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 5); // Top 5
}