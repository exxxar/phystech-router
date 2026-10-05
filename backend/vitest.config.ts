// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        globalSetup: './tests/setup.ts', // <-- Подключаем наш скрипт
        setupFiles: ['./tests/mock-data.ts'], // Если есть дополнительные моки
    },
});