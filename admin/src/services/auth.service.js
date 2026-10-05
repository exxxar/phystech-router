import api from './api';

export const authService = {
    /**
     * @param {Object} credentials - { email: string, password: string }
     * @returns {Promise<{ token: string, user: Object, permissions: Array }>}
     */
    login(credentials) {
        return api.post('/auth/login', credentials).then(res => res.data);
    },

    /**
     * Явный выход (инвалидация токена на backend, если поддерживается)
     */
    logout() {
        return api.post('/auth/logout').catch(() => {});
    },

    /**
     * Получить текущего пользователя
     * @returns {Promise<{ id, name, email, role, permissions }>}
     */
    getCurrentUser() {
        return api.get('/user').then(res => res.data);
    }
};