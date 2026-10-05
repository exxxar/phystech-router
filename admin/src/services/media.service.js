import api from './api';

export const mediaService = {
    /**
     * Загрузить файл
     * @param {File} file
     * @param {Object} metadata - { alt, description, tags }
     */
    upload(file, metadata = {}) {
        const formData = new FormData();
        formData.append('file', file);
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return api.post('/media', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        }).then(res => res.data);
    },

    /**
     * Получить список файлов
     * @param {Object} params - { page, limit, search, type }
     */
    getAll(params = {}) {
        return api.get('/admin/media', {params}).then(res => res.data);
    },

    getById(id) {
        return api.get(`/admin/media/${id}`).then(res => res.data);
    },

    delete(id) {
        return api.delete(`/admin/media/${id}`).then(res => res.data);
    },

    /**
     * Обновить метаданные
     * @param {string|number} id
     * @param {Object} data - { alt, description, tags }
     */
    update(id, data) {
        return api.put(`/admin/media/${id}`, data).then(res => res.data);
    }
};