// src/services/user.service.ts (фрагмент)
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function formatUserResponse(user: any, profile: any) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        interests: profile?.interests ? JSON.parse(profile.interests as string) : [],
        preferences: profile?.preferences ? JSON.parse(profile.preferences as string) : {},
    };
}

export async function getUserProfile(userId: number) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
    });

    if (!user) throw new Error('User not found');
    return formatUserResponse(user, user.profile);
}

export async function updateUserProfile(userId: number, data: any) {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name,
            profile: {
                upsert: {
                    create: {
                        interests: data.interests ? JSON.stringify(data.interests) : JSON.stringify([]),
                        preferences: data.preferences ? JSON.stringify(data.preferences) : JSON.stringify({}),
                    },
                    update: {
                        interests: data.interests ? JSON.stringify(data.interests) : undefined,
                        preferences: data.preferences ? JSON.stringify(data.preferences) : undefined,
                    }
                }
            }
        },
        include: { profile: true }
    });

    return formatUserResponse(user, user.profile);
}