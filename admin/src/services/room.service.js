import api from './api';

export const roomService = {
    /**
     * @param {Object} params - { page, limit, search, floorId, type, status }
     */
    getAll(params = {}) {
        return api.get('/admin/rooms', { params }).then(res => res.data);
    },

    getById(id) {
        return api.get(`/admin/rooms/${id}`).then(res => res.data);
    },

    /**
     * @param {Object} data - { number, name, floorId, type, description, coordinates, accessible, nodeId }
     */
    create(data) {
        return api.post('/admin/rooms', data).then(res => res.data);
    },

    update(id, data) {
        return api.put(`/admin/rooms/${id}`, data).then(res => res.data);
    },

    delete(id) {
        return api.delete(`/admin/rooms/${id}`).then(res => res.data);
    },


};