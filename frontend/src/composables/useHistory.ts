import { ref } from 'vue';
import { historyService } from '@/services/historyService';
import type { HistoryEntry } from '@/types';

export function useHistory() {
    const entries = ref<HistoryEntry[]>([]);
    const loading = ref(false);

    async function load() {
        loading.value = true;
        try { entries.value = await historyService.getAll(); } finally { loading.value = false; }
    }
    async function add(entry: Omit<HistoryEntry, 'id' | 'createdAt'>) {
        await historyService.add(entry);
        await load();
    }
    async function clear() { await historyService.clear(); entries.value = []; }

    return { entries, loading, load, add, clear };
}