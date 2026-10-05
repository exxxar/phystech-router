import api from './api';

export const objectService = {
    /**
     * @param {Object} params - { page, limit, search, status, type, categoryId, floorId }
     */
    getAll(params = {}) {
        return api.get('/admin/objects', { params }).then(res => res.data);
    },

    getById(id) {
        return api.get(`/admin/objects/${id}`).then(res => res.data);
    },

    /**
     * @param {Object} data - { name, shortName, type, categoryId, floorId, roomId, description, shortDescription, photo, images, coordinates, tags, eventId, status }
     */
    create(data) {
        return api.post('/admin/objects', data).then(res => res.data);
    },

    update(id, data) {
        return api.put(`/admin/objects/${id}`, data).then(res => res.data);
    },

    delete(id) {
        return api.delete(`/admin/objects/${id}`).then(res => res.data);
    },

    /**
     * @returns {{ total: number, published: number, drafts: number }}
     */
    getStats() {
        return api.get('/admin/objects/stats').then(res => res.data);
    }
};