import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Конфигурация тестовых пользователей по всем ролям
const SEED_USERS = [
    {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Администратор Системы',
        role: Role.admin,
        faculty: 'Управление',
        course: null,
        interests: ['management', 'security'],
        preferences: { shortRoute: false, avoidStairs: false }
    },
    {
        email: 'teacher@example.com',
        password: 'teacher123',
        name: 'Иванов Иван Иванович',
        role: Role.teacher,
        faculty: 'Кафедра компьютерных технологий',
        course: null,
        interests: ['programming', 'ai', 'databases'],
        preferences: { shortestRoute: true, avoidStairs: false }
    },
    {
        email: 'student@example.com',
        password: 'student123',
        name: 'Петров Петр Петрович',
        role: Role.student,
        faculty: 'Физико-технический факультет',
        course: 3,
        interests: ['programming', 'robotics', 'web'],
        preferences: { shortestRoute: true, avoidStairs: false }
    },
    {
        email: 'employee@example.com',
        password: 'employee123',
        name: 'Сидорова Анна Сергеевна',
        role: Role.employee,
        faculty: 'Деканат ФТФ',
        course: null,
        interests: ['administration'],
        preferences: { shortestRoute: true, avoidStairs: true }
    },
    {
        email: 'applicant@example.com',
        password: 'applicant123',
        name: 'Смирнов Алексей',
        role: Role.applicant,
        faculty: null,
        course: null,
        interests: ['it', 'engineering'],
        preferences: { shortestRoute: true, avoidStairs: false }
    },
    {
        email: 'guest@example.com',
        password: 'guest123',
        name: 'Гость',
        role: Role.guest,
        faculty: null,
        course: null,
        interests: [],
        preferences: { shortestRoute: false, avoidStairs: false }
    }
];

export async function seedUsers() {
    console.log('🔍 Проверка тестовых пользователей...');

    for (const userData of SEED_USERS) {
        try {
            // Проверяем, существует ли пользователь
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                console.log(`✓ Пользователь ${userData.email} (${userData.role}) уже существует`);
                continue;
            }

            // Хешируем пароль
            const passwordHash = await bcrypt.hash(userData.password, 10);

            // Создаем пользователя с профилем в транзакции
            const newUser = await prisma.$transaction(async (tx) => {
                const user = await tx.user.create({
                    data: {
                        email: userData.email,
                        passwordHash,
                        name: userData.name,
                        role: userData.role,
                    }
                });

                await tx.userProfile.create({
                    data: {
                        userId: user.id,
                        faculty: userData.faculty,
                        course: userData.course,
                        interests: JSON.stringify(userData.interests),
                        preferences: JSON.stringify(userData.preferences),
                    }
                });

                return user;
            });

            console.log(`✓ Создан пользователь: ${userData.email} (пароль: ${userData.password}, роль: ${userData.role})`);
        } catch (error: any) {
            console.error(`✗ Ошибка при создании ${userData.email}:`, error.message);
        }
    }

    console.log('✅ Проверка тестовых пользователей завершена\n');
}