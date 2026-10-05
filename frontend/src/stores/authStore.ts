import { defineStore } from 'pinia';
import { authService } from '@/services/authService';
import router from '@/router'; // <-- Импортируем экземпляр роутера напрямую

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: authService.getToken(),
        isAuthenticated: !!authService.getToken(),
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async login(email: string, password: string) {
            this.loading = true;
            this.error = null;
            try {
                const response = await authService.login(email, password);
                this.token = response.token;
                this.isAuthenticated = true;
                authService.setToken(response.token);
                return true;
            } catch (e: any) {
                this.error = e.message || 'Ошибка входа';
                return false;
            } finally {
                this.loading = false;
            }
        },

        async register(data: any) {
            this.loading = true;
            this.error = null;
            try {
                const response = await authService.register(data);
                this.token = response.token;
                this.isAuthenticated = true;
                authService.setToken(response.token);
                return true;
            } catch (e: any) {
                this.error = e.message || 'Ошибка регистрации';
                return false;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.token = null;
            this.isAuthenticated = false;
            authService.clearToken();

            // <-- Используем импортированный экземпляр роутера
            router.push('/login');
        },
    },
});