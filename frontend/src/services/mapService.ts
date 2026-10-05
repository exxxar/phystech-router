import { apiClient } from './api';
import { mockFloors, mockGraph } from '@/mock';
import type { Floor, Graph } from '@/types';

export const mapService = {
    getFloors: () => apiClient.get<Floor[]>('/floors', async () => mockFloors),
    getFloor: (id: number) =>
        apiClient.get<Floor>(`/floors/${id}`, async () => {
            const f = mockFloors.find((x) => x.number === id);
            if (!f) throw new Error('Этаж не найден');
            return f;
        }),
    getGraph: () => apiClient.get<Graph>('/graph', async () => mockGraph),
};