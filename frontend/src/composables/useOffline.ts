import { ref, onMounted, onUnmounted } from 'vue';

export function useOffline() {
    const isOffline = ref(!navigator.onLine);

    function update() { isOffline.value = !navigator.onLine; }

    onMounted(() => {
        window.addEventListener('online', update);
        window.addEventListener('offline', update);
    });
    onUnmounted(() => {
        window.removeEventListener('online', update);
        window.removeEventListener('offline', update);
    });

    return { isOffline };
}