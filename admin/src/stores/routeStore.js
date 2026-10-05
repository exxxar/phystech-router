import { defineStore } from 'pinia';
import { routeService } from '@/services/route.service';

export const useRouteStore = defineStore('routes', {
    state: () => ({
        currentRoute: null,
        comparison: null,
        availableNodes: [],
        loading: false,
        error: null
    }),

    actions: {
        async buildRoute(data) {
            this.loading = true;
            this.error = null;
            try {
                this.currentRoute = await routeService.buildRoute(data);
                return this.currentRoute;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async compareAlgorithms(data) {
            this.loading = true;
            try {
                this.comparison = await routeService.compareAlgorithms(data);
                return this.comparison;
            } catch (error) {
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async fetchAvailableNodes(params = {}) {
            try {
                this.availableNodes = await routeService.getAvailableNodes(params);
            } catch (error) {
                throw error;
            }
        },

        clearRoute() {
            this.currentRoute = null;
            this.comparison = null;
        }
    }
});