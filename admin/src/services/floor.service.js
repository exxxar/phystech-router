import api from './api';

export const floorService = {
    getAll() {
        return api.get('/admin/floors').then(res => res.data);
    },
    getById(id) {
        return api.get(`/admin/floors/${id}`).then(res => res.data);
    },
    /**
     * @param {Object} data - { number: string, name: string, svg_url: string, active: boolean }
     */
    create(data) {
        return api.post('/admin/floors', data).then(res => res.data);
    },
    /**
     * @param {string|number} id
     * @param {Object} data
     */
    update(id, data) {
        return api.put(`/admin/floors/${id}`, data).then(res => res.data);
    },
    delete(id) {
        return api.delete(`/admin/floors/${id}`).then(res => res.data);
    }
};