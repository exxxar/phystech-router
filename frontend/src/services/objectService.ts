import { apiClient } from './api';
import { mockObjects } from '@/mock';
import type { DepartmentObject, SearchFilters } from '@/types';

export const objectService = {
    getAll: () => apiClient.get<DepartmentObject[]>('/objects', async () => mockObjects),
    getById: (id: number) =>
        apiClient.get<DepartmentObject>(`/objects/${id}`, async () => {
            const obj = mockObjects.find((o) => o.id === id);
            if (!obj) throw new Error('Объект не найден');
            return obj;
        }),
    search: (filters: SearchFilters) =>
        apiClient.get<DepartmentObject[]>('/objects/search', async () => {
            let result = [...mockObjects];
            if (filters.query) {
                const q = filters.query.toLowerCase();
                result = result.filter(
                    (o) =>
                        o.name.toLowerCase().includes(q) ||
                        o.description.toLowerCase().includes(q) ||
                        o.tags.some((t) => t.toLowerCase().includes(q)) ||
                        o.roomNumber?.includes(q),
                );
            }
            if (filters.floor) result = result.filter((o) => o.floor === filters.floor);
            if (filters.category) result = result.filter((o) => o.category === filters.category);
            if (filters.type) result = result.filter((o) => o.type === filters.type);
            if (filters.accessible !== undefined)
                result = result.filter((o) => o.availability.isAvailable === filters.accessible);
            return result;
        }),
};