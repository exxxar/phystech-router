import { apiClient } from './api';
import type { HistoryEntry } from '@/types';

const KEY = 'history';
const read = (): HistoryEntry[] => JSON.parse(localStorage.getItem(KEY) || '[]');
const write = (v: HistoryEntry[]) => localStorage.setItem(KEY, JSON.stringify(v));

export const historyService = {
    getAll: () => apiClient.get<HistoryEntry[]>('/history', async () => read()),
    add: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) =>
        apiClient.post<HistoryEntry>('/history', entry, async () => {
            const item: HistoryEntry = {
                id: `h_${Date.now()}`,
                ...entry,
                createdAt: new Date().toISOString(),
            };
            const list = read();
            list.unshift(item);
            write(list.slice(0, 100));
            return item;
        }),
    clear: () => apiClient.delete<void>('/history', async () => { write([]); }),
};