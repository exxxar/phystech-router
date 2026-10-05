import { ref, computed } from 'vue';

export function usePagination(itemsPerPage = 10) {
    const currentPage = ref(1);
    const perPage = ref(itemsPerPage);
    const totalItems = ref(0);

    const totalPages = computed(() => Math.ceil(totalItems.value / perPage.value));

    const offset = computed(() => (currentPage.value - 1) * perPage.value);

    const setPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page;
        }
    };

    const nextPage = () => setPage(currentPage.value + 1);
    const prevPage = () => setPage(currentPage.value - 1);

    const resetPagination = () => {
        currentPage.value = 1;
        totalItems.value = 0;
    };

    return {
        currentPage,
        perPage,
        totalItems,
        totalPages,
        offset,
        setPage,
        nextPage,
        prevPage,
        resetPagination
    };
}