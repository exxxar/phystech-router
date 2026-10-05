import api from './api';

export const categoryService = {
    getAll() {
        return api.get('/admin/categories').then(res => res.data);
    },

    getById(id) {
        return api.get(`/admin/categories/${id}`).then(res => res.data);
    },

    /**
     * @param {Object} data - { name, slug, description, icon, order, active }
     */
    create(data) {
        return api.post('/admin/categories', data).then(res => res.data);
    },

    update(id, data) {
        return api.put(`/admin/categories/${id}`, data).then(res => res.data);
    },

    delete(id) {
        return api.delete(`/admin/categories/${id}`).then(res => res.data);
    }
};