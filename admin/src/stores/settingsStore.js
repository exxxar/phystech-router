import { defineStore } from 'pinia';
import { settingsService } from '@/services/settings.service';

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        general: {
            title: '',
            description: '',
            contactEmail: '',
            contactPhone: ''
        },
        navigation: {
            defaultAlgorithm: 'dijkstra',
            defaultAccessible: false,
            avoidStairsByDefault: false,
            maxRouteLength: 1000
        },
        map: {
            defaultZoom: 1,
            minZoom: 0.5,
            maxZoom: 3,
            routeColor: '#0d6efd',
            routeWidth: 4,
            nodeColor: '#0d6efd',
            showRoomNumbers: true
        },
        apiInfo: null,
        loading: false,
        error: null
    }),

    actions: {
        async fetchSettings() {
            this.loading = true;
            this.error = null;
            try {
                const response = await settingsService.getAll();
                // Безопасное объединение с дефолтными значениями
                const data = response?.data || response || {};
                if (data.general) this.general = { ...this.general, ...data.general };
                if (data.navigation) this.navigation = { ...this.navigation, ...data.navigation };
                if (data.map) this.map = { ...this.map, ...data.map };
            } catch (error) {
                this.error = error.message;
                console.warn('Не удалось загрузить настройки (возможно, endpoint ещё не готов):', error);
            } finally {
                this.loading = false;
            }
        },

        async updateSettings(data) {
            this.loading = true;
            try {
                const response = await settingsService.update(data);
                const resData = response?.data || response || {};
                if (resData.general) this.general = { ...this.general, ...resData.general };
                if (resData.navigation) this.navigation = { ...this.navigation, ...resData.navigation };
                if (resData.map) this.map = { ...this.map, ...resData.map };
                return response;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchApiInfo() {
            try {
                const response = await settingsService.getApiInfo();
                this.apiInfo = response?.data || response || null;
            } catch (error) {
                console.warn('Не удалось загрузить информацию об API:', error);
                this.apiInfo = null;
            }
        }
    }
});