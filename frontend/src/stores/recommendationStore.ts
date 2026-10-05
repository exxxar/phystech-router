import { defineStore } from 'pinia';
import { recommendationService } from '@/services/recommendationService';
import type { Recommendation } from '@/types';

export const useRecommendationStore = defineStore('recommendation', {
    state: () => ({
        items: [] as Recommendation[],
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async load(context: any) {
            this.loading = true;
            try { this.items = await recommendationService.get(context); }
            catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
    },
});