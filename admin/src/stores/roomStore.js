import { defineStore } from 'pinia';
import { roomService } from '@/services/room.service';

export const useRoomStore = defineStore('rooms', {
    state: () => ({ items: [], current: null, loading: false, error: null, totalItems: 0 }),
    actions: {
        async fetchRooms(params = {}) {
            this.loading = true; this.error = null;
            try {
                const response = await roomService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } catch (error) { this.error = error.message; throw error; }
            finally { this.loading = false; }
        },
        async fetchRoom(id) {
            this.loading = true;
            try {
                const response = await roomService.getById(id);
                this.current = response.data || response;
                return this.current;
            } finally { this.loading = false; }
        },
        async createRoom(data) { return await roomService.create(data); },
        async updateRoom(id, data) { return await roomService.update(id, data); },
        async deleteRoom(id) {
            await roomService.delete(id);
            this.items = this.items.filter(r => r.id !== id);
        }
    }
});