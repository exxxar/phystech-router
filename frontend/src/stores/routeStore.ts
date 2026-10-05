import { defineStore } from 'pinia';
import { routeService } from '@/services/routeService';
import type { Route } from '@/types';

export const useRouteStore = defineStore('route', {
    state: () => ({
        current: null as Route | null,
        history: [] as Route[],
        stepIndex: 0,
        active: false,
        loading: false,
        error: null as string | null,
    }),
    getters: {
        currentStep: (state) => state.current?.steps[state.stepIndex] || null,
        progress: (state) => {
            if (!state.current) return 0;
            return ((state.stepIndex + 1) / state.current.steps.length) * 100;
        },
    },
    actions: {
        async build(from: string, to: string) {
            this.loading = true;
            this.error = null;
            try {
                this.current = await routeService.build(from, to);
                this.stepIndex = 0;
                this.history.unshift(this.current);
            } catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
        nextStep() {
            if (!this.current) return;
            if (this.stepIndex < this.current.steps.length - 1) this.stepIndex++;
        },
        prevStep() { if (this.stepIndex > 0) this.stepIndex--; },
        startNavigation() { this.active = true; this.stepIndex = 0; },
        stopNavigation() { this.active = false; },
    },
});