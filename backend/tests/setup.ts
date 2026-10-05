// tests/setup.ts
import { execSync } from 'child_process';
import dotenv from 'dotenv';
import path from 'path';

// Принудительно загружаем переменные для тестов
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

export default async function globalSetup() {
    console.log('🔄 Инициализация тестовой базы данных (SQLite)...');

    try {
        // Сбрасываем и применяем миграции к тестовой БД
        execSync('npx prisma migrate reset --force --skip-seed', {
            stdio: 'inherit',
            env: {
                ...process.env,
                DB_PROVIDER: 'sqlite',
                DATABASE_URL: 'file:./tests/test.db'
            }
        });
        console.log('✅ Тестовая база данных готова.');
    } catch (error) {
        console.error('❌ Ошибка при настройке тестовой БД:', error);
        process.exit(1);
    }
}