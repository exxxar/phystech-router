import { ref } from 'vue';
import { favoriteService } from '@/services/favoriteService';
import type { Favorite } from '@/types';

export function useFavorites() {
    const list = ref<Favorite[]>([]);
    const loading = ref(false);

    async function load() {
        loading.value = true;
        try { list.value = await favoriteService.getAll(); } finally { loading.value = false; }
    }
    async function add(objectId: number) {
        await favoriteService.add(objectId);
        await load();
    }
    async function remove(objectId: number) {
        await favoriteService.remove(objectId);
        await load();
    }
    function has(objectId: number) { return list.value.some((f) => f.objectId === objectId); }

    return { list, loading, load, add, remove, has };
}