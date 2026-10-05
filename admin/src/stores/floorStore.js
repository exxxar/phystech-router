import { defineStore } from 'pinia';
import { floorService } from '@/services/floor.service';

export const useFloorStore = defineStore('floors', {
    state: () => ({
        items: [],
        current: null,
        loading: false,
        error: null,
        totalItems: 0
    }),

    getters: {
        activeFloors(state) {
            return state.items.filter(f => f.active);
        }
    },

    actions: {
        async fetchFloors(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await floorService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } catch (error) {
                this.error = error.message || 'Ошибка загрузки этажей';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchFloor(id) {
            this.loading = true;
            this.error = null;
            try {
                const response = await floorService.getById(id);
                this.current = response.data || response;
                return this.current;
            } catch (error) {
                this.error = error.message || 'Ошибка загрузки этажа';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createFloor(data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await floorService.create(data);
                return response.data || response;
            } catch (error) {
                this.error = error.message || 'Ошибка создания этажа';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateFloor(id, data) {
            this.loading = true;
            this.error = null;
            try {
                const response = await floorService.update(id, data);
                return response.data || response;
            } catch (error) {
                this.error = error.message || 'Ошибка обновления этажа';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteFloor(id) {
            this.loading = true;
            this.error = null;
            try {
                await floorService.delete(id);
                this.items = this.items.filter(f => f.id !== id);
            } catch (error) {
                this.error = error.message || 'Ошибка удаления этажа';
                throw error;
            } finally {
                this.loading = false;
            }
        }
    }
});