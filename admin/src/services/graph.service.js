import api from './api';

export const graphService = {
    /**
     * Получить граф для этажа
     * @param {string|number} floorId
     * @returns {{ nodes: Array, edges: Array }}
     */
    getFloorGraph(floorId) {
        return api.get(`/admin/floors/${floorId}/graph`).then(res => res.data);
    },

    /**
     * Создать узел графа
     * @param {Object} data - { floorId, x, y, type, accessible, roomId }
     */
    createNode(data) {
        return api.post('/admin/graph/nodes', data).then(res => res.data);
    },

    /**
     * Обновить узел
     * @param {string|number} nodeId
     * @param {Object} data
     */
    updateNode(nodeId, data) {
        return api.put(`/admin/graph/nodes/${nodeId}`, data).then(res => res.data);
    },

    deleteNode(nodeId) {
        return api.delete(`/admin/graph/nodes/${nodeId}`).then(res => res.data);
    },

    /**
     * Создать ребро (связь)
     * @param {Object} data - { fromNodeId, toNodeId, weight, type, accessible }
     * Типы: 'room-corridor', 'corridor-corridor', 'stairs', 'interfloor', 'entrance'
     */
    createEdge(data) {
        return api.post('/admin/graph/edges', data).then(res => res.data);
    },

    updateEdge(edgeId, data) {
        return api.put(`/admin/graph/edges/${edgeId}`, data).then(res => res.data);
    },

    deleteEdge(edgeId) {
        return api.delete(`/admin/graph/edges/${edgeId}`).then(res => res.data);
    },

    /**
     * Проверка графа на изолированные узлы и доступность
     * @param {string|number} floorId
     */
    validateGraph(floorId) {
        return api.get(`/admin/floors/${floorId}/graph/validate`).then(res => res.data);
    }
};