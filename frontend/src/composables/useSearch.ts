import { ref, computed } from 'vue';
import { objectService } from '@/services/objectService';
import { useDebounce } from './useDebounce';
import type { DepartmentObject, SearchFilters } from '@/types';

export function useSearch() {
    const filters = ref<SearchFilters>({ query: '', floor: undefined, category: undefined, type: undefined });
    const results = ref<DepartmentObject[]>([]);
    const loading = ref(false);
    const debouncedQuery = useDebounce(() => filters.value.query, 300);

    async function search() {
        loading.value = true;
        try {
            results.value = await objectService.search(filters.value);
        } finally {
            loading.value = false;
        }
    }

    return { filters, results, loading, debouncedQuery, search };
}