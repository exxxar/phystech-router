import { apiClient } from './api';
import type { Favorite } from '@/types';

const KEY = 'favorites';
const read = (): Favorite[] => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = (v: Favorite[]) => localStorage.setItem(KEY, JSON.stringify(v));

export const favoriteService = {
    getAll: () => apiClient.get<Favorite[]>('/favorites', async () => read()),
    add: (objectId: number) =>
        apiClient.post<Favorite>('/favorites', { objectId }, async () => {
            const list = read();
            const item = { objectId, createdAt: new Date().toISOString() };
            list.push(item);
            write(list);
            return item;
        }),
    remove: (objectId: number) =>
        apiClient.delete<void>(`/favorites/${objectId}`, async () => {
            write(read().filter((f) => f.objectId !== objectId));
        }),
};