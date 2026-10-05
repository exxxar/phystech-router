import api from './api';

export const userService = {
    /**
     * Получить список пользователей
     * @param {Object} params - { page, limit, search, role }
     * @returns {{ data: Array, total: number }}
     */
    getAll(params = {}) {
        return api.get('/admin/users', { params }).then(res => res.data);
    },

    getById(id) {
        return api.get(`/admin/users/${id}`).then(res => res.data);
    },

    /**
     * Создать пользователя
     * @param {Object} data - { name, email, password, role }
     */
    create(data) {
        return api.post('/admin/users', data).then(res => res.data);
    },

    update(id, data) {
        return api.put(`/admin/users/${id}`, data).then(res => res.data);
    },

    delete(id) {
        return api.delete(`/admin/users/${id}`).then(res => res.data);
    },

    /**
     * Сменить статус (активен/заблокирован)
     * @param {string|number} id
     * @param {boolean} active
     */
    toggleStatus(id, active) {
        return api.patch(`/admin/users/${id}/status`, { active }).then(res => res.data);
    }
};