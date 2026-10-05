import { defineStore } from 'pinia';
import { objectService } from '@/services/object.service';

export const useObjectStore = defineStore('objects', {
    state: () => ({
        items: [],
        current: null,
        loading: false,
        error: null,
        totalItems: 0,
        stats: {
            total: 0,
            published: 0,
            drafts: 0
        }
    }),

    getters: {
        publishedObjects(state) {
            return state.items.filter(o => o.status === 'published');
        },
        draftObjects(state) {
            return state.items.filter(o => o.status === 'draft');
        }
    },

    actions: {
        async fetchObjects(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await objectService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } catch (error) {
                this.error = error.message || 'Ошибка загрузки объектов';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchObject(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await objectService.getById(id);
                this.current = response.data || response;
                return this.current;
            } catch (error) {
                this.error = error.message || 'Ошибка загрузки объекта';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createObject(data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await objectService.create(data);
                return response.data || response;
            } catch (error) {
                this.error = error.message || 'Ошибка создания объекта';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateObject(id, data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await objectService.update(id, data);
                return response.data || response;
            } catch (error) {
                this.error = error.message || 'Ошибка обновления объекта';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteObject(id) {
            this.loading = true;
            this.error = null;
            try {
                await objectService.delete(id);
                this.items = this.items.filter(o => o.id !== id);
            } catch (error) {
                this.error = error.message || 'Ошибка удаления объекта';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const response = await objectService.getStats();
                // Безопасное извлечение данных с fallback на нули
                this.stats = response?.data || response || { total: 0, published: 0, drafts: 0 };
            } catch (error) {
                // Не ломаем приложение, просто предупреждаем в консоли
                console.warn('Статистика объектов недоступна (возможно, endpoint ещё не реализован на бэкенде):', error);
                this.stats = { total: 0, published: 0, drafts: 0 };
            }
        }
    }
});