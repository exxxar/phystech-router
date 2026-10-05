import { defineStore } from 'pinia';
import { favoriteService } from '@/services/favoriteService';
import type { Favorite } from '@/types';

export const useFavoriteStore = defineStore('favorite', {
    state: () => ({
        items: [] as Favorite[],
        loading: false,
    }),
    actions: {
        async load() {
            this.loading = true;
            try { this.items = await favoriteService.getAll(); }
            finally { this.loading = false; }
        },
        async add(objectId: number) {
            await favoriteService.add(objectId);
            await this.load();
        },
        async remove(objectId: number) {
            await favoriteService.remove(objectId);
            await this.load();
        },
        has(objectId: number) { return this.items.some((f) => f.objectId === objectId); },
    },
});