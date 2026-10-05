import { ref } from 'vue';

export function useApi<T>() {
    const data = ref<T | null>(null) as { value: T | null };
    const loading = ref(false);
    const error = ref<string | null>(null);

    async function call(fn: () => Promise<T>) {
        loading.value = true;
        error.value = null;
        try {
            data.value = await fn();
        } catch (e: any) {
            error.value = e?.message || 'Ошибка';
        } finally {
            loading.value = false;
        }
        return data.value;
    }

    return { data, loading, error, call };
}