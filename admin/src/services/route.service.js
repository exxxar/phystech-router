import api from './api';

export const routeService = {
    /**
     * Построить маршрут между двумя точками
     * @param {Object} data - { fromNodeId, toNodeId, floorId, accessible, avoidStairs }
     * @returns {{ path: Array, length: number, transitions: number, floors: number, duration: number, algorithm: string }}
     */
    buildRoute(data) {
        return api.post('/admin/routes', data).then(res => res.data);
    },

    /**
     * Сравнить алгоритмы маршрутизации
     * @param {Object} data - { fromNodeId, toNodeId, floorId }
     * @returns {{ algorithms: Array }}
     */
    compareAlgorithms(data) {
        return api.post('/admin/experimental/routes/compare', data).then(res => res.data);
    },

    /**
     * Получить все узлы для выбора (с фильтрацией по этажу)
     * @param {Object} params - { floorId }
     */
    getAvailableNodes(params = {}) {
        return api.get('/admin/graph/nodes', { params }).then(res => res.data);
    }
};