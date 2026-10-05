import { ref, computed } from 'vue';
import { routeService } from '@/services/routeService';
import type { Route } from '@/types';

export function useRoute() {
    const route = ref<Route | null>(null);
    const currentStepIndex = ref(0);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const active = ref(false);

    const currentStep = computed(() => route.value?.steps[currentStepIndex.value] || null);
    const progress = computed(() => {
        if (!route.value) return 0;
        return ((currentStepIndex.value + 1) / route.value.steps.length) * 100;
    });

    async function build(from: string, to: string) {
        loading.value = true;
        error.value = null;
        try {
            route.value = await routeService.build(from, to);
            currentStepIndex.value = 0;
        } catch (e: any) {
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    function next() {
        if (!route.value) return;
        if (currentStepIndex.value < route.value.steps.length - 1) currentStepIndex.value++;
    }
    function prev() {
        if (currentStepIndex.value > 0) currentStepIndex.value--;
    }
    function start() { active.value = true; currentStepIndex.value = 0; }
    function stop() { active.value = false; }

    return { route, currentStep, progress, loading, error, active, build, next, prev, start, stop };
}