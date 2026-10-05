import { defineStore } from 'pinia';
import { authService } from '@/services/auth.service';
import api from '@/services/api';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        token: localStorage.getItem('admin_token') || null,
        permissions: [],
        isLoading: false,
        isRestoring: false,
        error: null
    }),

    getters: {
        // isAuthenticated теперь проверяет только наличие токена
        isAuthenticated: (state) => !!state.token,
        isAdmin: (state) => state.user?.role === 'administrator' || state.user?.role === 'student', // Добавьте 'student', если это админская роль в вашей системе
        hasPermission: (state) => (permission) => {
            if (!state.token) return false;
            if (state.user?.role === 'administrator' || state.user?.role === 'student') return true;
            if (!state.permissions || state.permissions.length === 0) return true;
            return state.permissions.includes(permission);
        }
    },

    actions: {
        async login(credentials) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await authService.login(credentials);

                // !!! ИСПРАВЛЕНИЕ ЗДЕСЬ !!!
                // response.data - это весь объект { success: true, data: { token, user } }
                const payload = response.data;

                this.token = payload.token;
                this.user = payload.user;
                this.permissions = payload.user?.permissions || [];

                localStorage.setItem('admin_token', this.token);
                return true; // Возвращаем true, чтобы Login.vue сделал редирект
            } catch (error) {
                this.error = error.response?.data?.message || 'Ошибка авторизации';
                this.token = null;
                this.user = null;
                this.permissions = [];
                localStorage.removeItem('admin_token');
                return false;
            } finally {
                this.isLoading = false;
            }
        },

        async restoreSession() {
            if (!this.token) {
                return false;
            }

            this.isRestoring = true;
            try {
                // Предполагаем, что бэкенд возвращает { success: true, data: { id, email, name, role... } }
                const response = await api.get('/user');

                // !!! ИСПРАВЛЕНИЕ ЗДЕСЬ !!!
                const userData = response.data?.data || response.data;

                this.user = userData;
                this.permissions = userData.permissions || [];
                return true;
            } catch (error) {
                console.warn('Сессия невалидна, выполняется выход', error);
                this.logout();
                return false;
            } finally {
                this.isRestoring = false;
            }
        },

        logout() {
            if (this.token) {
                authService.logout().catch(() => {});
            }
            this.token = null;
            this.user = null;
            this.permissions = [];
            localStorage.removeItem('admin_token');
        }
    }
});