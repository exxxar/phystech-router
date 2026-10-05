import api from './api';

export const settingsService = {
    /**
     * Получить все настройки
     * @returns {{ general: Object, navigation: Object, map: Object, api: Object }}
     */
    getAll() {
        return api.get('/admin/settings').then(res => res.data);
    },

    /**
     * Обновить настройки
     * @param {Object} data - { general, navigation, map }
     */
    update(data) {
        return api.put('/admin/settings', data).then(res => res.data);
    },

    /**
     * Получить только техническую информацию API (без секретов)
     */
    getApiInfo() {
        return api.get('/admin/settings/api-info').then(res => res.data);
    }
};