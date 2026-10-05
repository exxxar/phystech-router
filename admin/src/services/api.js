import axios from 'axios';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Добавление JWT
api.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Глобальная обработка ошибок (Правило 22)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // Очистка состояния и редирект
                    const authStore = useAuthStore();
                    authStore.logout();
                    router.push('/login');
                    break;
                case 403:
                    console.error('Доступ запрещён: недостаточно прав');
                    // Здесь можно вызвать useNotification().error('Недостаточно прав')
                    break;
                case 422:
                    // Ошибка валидации, прокидываем дальше для отображения в формах
                    return Promise.reject(error.response.data);
                case 500:
                    console.error('Внутренняя ошибка сервера');
                    break;
            }
        }
        return Promise.reject(error);
    }
);

export default api;