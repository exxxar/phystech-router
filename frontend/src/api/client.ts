const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export class ApiClient {
    private baseUrl: string;
    private useMock: boolean;

    constructor() {
        this.baseUrl = BASE_URL;
        this.useMock = USE_MOCK;
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    private async request<T>(
        method: string,
        path: string,
        body?: any,
        options: { mock?: () => Promise<T> } = {},
    ): Promise<T> {
        // 1. Если включены моки и есть mock-функция, используем её (для отладки)
        if (this.useMock && options.mock) {
            await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
            return options.mock();
        }

        // 2. Формируем заголовки
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };

        // 3. Добавляем токен, если он есть
        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // 4. Делаем реальный запрос
        try {
            const response = await fetch(`${this.baseUrl}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            // 5. Обрабатываем ошибки (401, 404, 500)
            if (!response.ok) {
                if (response.status === 401) {
                    // Если токен протух, чистим его и редиректим на логин
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || `Ошибка сервера: ${response.status}`);
            }

            // 6. Возвращаем данные (учитываем, что некоторые фреймворки, как Laravel,
            // могут оборачивать ответ в { data: ... }. Если у вас так, раскомментируйте строку ниже):
            // const json = await response.json();
            // return json.data !== undefined ? json.data : json;

            return await response.json();
        } catch (error: any) {
            console.error(`API Error [${method} ${path}]:`, error.message);
            throw error;
        }
    }

    get<T>(path: string, mock?: () => Promise<T>) {
        return this.request<T>('GET', path, undefined, { mock });
    }
    post<T>(path: string, body: any, mock?: () => Promise<T>) {
        return this.request<T>('POST', path, body, { mock });
    }
    put<T>(path: string, body: any, mock?: () => Promise<T>) {
        return this.request<T>('PUT', path, body, { mock });
    }
    delete<T>(path: string, mock?: () => Promise<T>) {
        return this.request<T>('DELETE', path, undefined, { mock });
    }
}

export const apiClient = new ApiClient();