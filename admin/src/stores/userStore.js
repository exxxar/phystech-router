import { defineStore } from 'pinia';
import { userService } from '@/services/user.service';

export const useUserStore = defineStore('users', {
    state: () => ({
        items: [],
        current: null,
        loading: false,
        error: null,
        totalItems: 0
    }),

    getters: {
        administrators: (state) => state.items.filter(u => u.role === 'administrator'),
        editors: (state) => state.items.filter(u => u.role === 'editor'),
        viewers: (state) => state.items.filter(u => u.role === 'viewer')
    },

    actions: {
        async fetchUsers(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await userService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchUser(id) {
            this.loading = true;
            try {
                this.current = await userService.getById(id);
                return this.current;
            } finally {
                this.loading = false;
            }
        },

        async createUser(data) {
            const user = await userService.create(data);
            this.items.unshift(user);
            return user;
        },

        async updateUser(id, data) {
            const updated = await userService.update(id, data);
            const index = this.items.findIndex(u => u.id === id);
            if (index !== -1) this.items[index] = { ...this.items[index], ...updated };
            return updated;
        },

        async deleteUser(id) {
            await userService.delete(id);
            this.items = this.items.filter(u => u.id !== id);
        },

        async toggleStatus(id, active) {
            const updated = await userService.toggleStatus(id, active);
            const index = this.items.findIndex(u => u.id === id);
            if (index !== -1) this.items[index] = { ...this.items[index], ...updated };
            return updated;
        }
    }
});