import { defineStore } from 'pinia';
import { objectService } from '@/services/objectService';
import type { DepartmentObject, SearchFilters } from '@/types';

export const useObjectStore = defineStore('object', {
    state: () => ({
        objects: [] as DepartmentObject[],
        current: null as DepartmentObject | null,
        searchResults: [] as DepartmentObject[],
        filters: { query: '' } as SearchFilters,
        loading: false,
        error: null as string | null,
    }),
    getters: {
        byId: (state) => (id: number) => state.objects.find((o) => o.id === id),
    },
    actions: {
        async loadAll() {
            this.loading = true;
            try { this.objects = await objectService.getAll(); }
            catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
        async loadById(id: number) {
            this.loading = true;
            try { this.current = await objectService.getById(id); }
            catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
        async search(filters: SearchFilters) {
            this.loading = true;
            this.filters = filters;
            try { this.searchResults = await objectService.search(filters); }
            catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
    },
});