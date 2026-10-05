import { defineStore } from 'pinia';
import { eventService } from '@/services/event.service';

export const useEventStore = defineStore('events', {
    state: () => ({ items: [], current: null, loading: false, totalItems: 0 }),
    actions: {
        async fetchEvents(params = {}) {
            this.loading = true;
            try {
                const response = await eventService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } finally { this.loading = false; }
        },
        async fetchEvent(id) {
            this.loading = true;
            try { this.current = await eventService.getById(id); }
            finally { this.loading = false; }
        },
        async createEvent(data) { return await eventService.create(data); },
        async updateEvent(id, data) { return await eventService.update(id, data); },
        async deleteEvent(id) {
            await eventService.delete(id);
            this.items = this.items.filter(e => e.id !== id);
        }
    }
});