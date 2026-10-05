import { defineStore } from 'pinia';
import { mediaService } from '@/services/media.service';

export const useMediaStore = defineStore('media', {
    state: () => ({
        items: [],
        loading: false,
        error: null,
        totalItems: 0,
        uploading: false
    }),

    actions: {
        async fetchMedia(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const response = await mediaService.getAll(params);
                this.items = response.data || response;
                this.totalItems = response.total || this.items.length;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async uploadFile(file, metadata = {}) {
            this.uploading = true;
            try {
                const media = await mediaService.upload(file, metadata);
                this.items.unshift(media);
                return media;
            } catch (error) {
                throw error;
            } finally {
                this.uploading = false;
            }
        },

        async deleteMedia(id) {
            try {
                await mediaService.delete(id);
                this.items = this.items.filter(m => m.id !== id);
            } catch (error) {
                throw error;
            }
        },

        async updateMedia(id, data) {
            try {
                const updated = await mediaService.update(id, data);
                const index = this.items.findIndex(m => m.id === id);
                if (index !== -1) {
                    this.items[index] = { ...this.items[index], ...updated };
                }
                return updated;
            } catch (error) {
                throw error;
            }
        }
    }
});