import api from './api';

export const eventService = {
    getAll(params = {}) {
        return api.get('/admin/events', {params}).then(res => res.data);
    },
    getById(id) {
        return api.get(`/admin/events/${id}`).then(res => res.data);
    },
    create(data) {
        return api.post('/admin/events', data).then(res => res.data);
    },
    update(id, data) {
        return api.put(`/admin/events/${id}`, data).then(res => res.data);
    },
    delete(id) {
        return api.delete(`/admin/events/${id}`).then(res => res.data);
    }
};