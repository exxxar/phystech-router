import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient();

// Вспомогательная функция для форматирования ответа под фронтенд
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

export async function registerUser(data: { name: string; email: string; password: string; role: string }) {
    // 1. Проверяем, не занят ли email
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
    }

    // 2. Хешируем пароль
    const passwordHash = await bcrypt.hash(data.password, 10);

    // 3. Создаем пользователя и пустой профиль транзакцией
    const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: data.role as any,
            },
        });

        await tx.userProfile.create({
            data: {
                userId: newUser.id,
                interests: JSON.stringify([]),
                preferences: JSON.stringify({}),
            },
        });

        return newUser;
    });

    // 4. Получаем профиль для ответа
    const profile = await prisma.userProfile.findUnique({ where: { userId: result.id } });

    // 5. Генерируем токен
    const token = jwt.sign(
        { id: result.id, role: result.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES }
    );

    return {
        token,
        user: formatUserResponse(result, profile),
    };
}

export async function loginUser(email: string, password: string) {
    // 1. Ищем пользователя
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error('Неверный email или пароль');
    }

    // 2. Проверяем пароль
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
        throw new Error('Неверный email или пароль');
    }

    // 3. Получаем профиль
    const profile = await prisma.userProfile.findUnique({ where: { userId: user.id } });

    // 4. Генерируем токен
    const token = jwt.sign(
        { id: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_ACCESS_EXPIRES }
    );

    return {
        token,
        user: formatUserResponse(user, profile),
    };
}