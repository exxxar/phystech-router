import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
        email: z.string().email('Некорректный формат email'),
        password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
        role: z.enum(['student', 'teacher', 'employee', 'applicant', 'guest', 'admin']).optional().default('student'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Некорректный формат email'),
        password: z.string().min(1, 'Пароль обязателен'),
    }),
});