import { apiClient } from './api';
import { mockUser } from '@/mock';
import type { User } from '@/types';

const KEY = 'auth_token';
const USER_KEY = 'user';

export const authService = {
    getToken: () => localStorage.getItem(KEY),
    setToken: (t: string) => localStorage.setItem(KEY, t),
    clearToken: () => {
        localStorage.removeItem(KEY);
        localStorage.removeItem(USER_KEY);
    },

    login: (email: string, password: string) =>
        apiClient.post<{ token: string; user: User }>('/api/auth/login', { email, password }, async () => {
            // Mock-логика: принимаем любые непустые данные
            if (!email || !password) throw new Error('Заполните все поля');
            const token = 'mock_jwt_token_' + Date.now();
            const user = { ...mockUser, name: email.split('@')[0] || 'Пользователь' };
            localStorage.setItem(KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return { token, user };
        }),

    register: (data: { name: string; email: string; password: string; role: string }) =>
        apiClient.post<{ token: string; user: User }>('/api/auth/register', data, async () => {
            if (!data.name || !data.email || !data.password) throw new Error('Заполните все обязательные поля');
            const token = 'mock_jwt_token_' + Date.now();
            const user: User = {
                id: Date.now(),
                name: data.name,
                role: data.role as any,
                interests: [],
                preferences: {},
            };
            localStorage.setItem(KEY, token);
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return { token, user };
        }),

    getUser: () =>
        apiClient.get<User>('/api/user', async () => {
            const stored = localStorage.getItem(USER_KEY);
            return stored ? JSON.parse(stored) : mockUser;
        }),

    updateUser: (user: User) =>
        apiClient.put<User>('/api/user', user, async () => {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            return user;
        }),
};