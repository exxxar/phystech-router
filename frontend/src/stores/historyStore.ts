import { defineStore } from 'pinia';
import { historyService } from '@/services/historyService';
import type { HistoryEntry } from '@/types';

export const useHistoryStore = defineStore('history', {
    state: () => ({
        entries: [] as HistoryEntry[],
        loading: false,
    }),
    actions: {
        async load() {
            this.loading = true;
            try { this.entries = await historyService.getAll(); }
            finally { this.loading = false; }
        },
        async add(entry: Omit<HistoryEntry, 'id' | 'createdAt'>) {
            await historyService.add(entry);
            await this.load();
        },
        async clear() { await historyService.clear(); this.entries = []; },
    },
});