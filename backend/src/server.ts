import app from './app';
import { env } from './config/env';
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './utils/seed-users'; // <-- Новый импорт

const prisma = new PrismaClient();

const start = async () => {
    try {
        // 1. Подключение к БД
        await prisma.$connect();
        console.log('✅ Database connected successfully');

        // 2. Инициализация тестовых пользователей
        await seedUsers(); // <-- Вызов функции

        // 3. Запуск HTTP-сервера
        app.listen(env.PORT, () => {
            console.log(`🚀 Server is running on http://localhost:${env.PORT}`);
            console.log(`📝 API docs available at http://localhost:${env.PORT}/api/docs`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

start();