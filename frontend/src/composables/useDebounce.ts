import { ref, watch } from 'vue';

export function useDebounce<T>(value: () => T, delay = 300) {
    const debounced = ref<T>(value()) as { value: T };
    let timer: any;
    watch(value, (v) => {
        clearTimeout(timer);
        timer = setTimeout(() => { debounced.value = v; }, delay);
    });
    return debounced;
}