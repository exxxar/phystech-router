import { ref } from 'vue';

export function useGeolocation() {
    const latitude = ref<number | null>(null);
    const longitude = ref<number | null>(null);
    const error = ref<string | null>(null);
    const loading = ref(false);

    async function request() {
        if (!('geolocation' in navigator)) {
            error.value = 'Геолокация недоступна в этом браузере';
            return;
        }
        loading.value = true;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                latitude.value = pos.coords.latitude;
                longitude.value = pos.coords.longitude;
                error.value = null;
                loading.value = false;
            },
            (err) => {
                error.value = 'Не удалось определить местоположение';
                loading.value = false;
            },
            { enableHighAccuracy: true, timeout: 10000 },
        );
    }

    return { latitude, longitude, error, loading, request };
}