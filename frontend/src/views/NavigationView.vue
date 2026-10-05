<template>
  <div class="container py-3">
    <div v-if="!routeStore.current" class="text-center py-5">
      <i class="bi bi-signpost-split text-muted" style="font-size: 64px;"></i>
      <p class="text-muted mt-3">Маршрут не найден</p>
      <router-link to="/route" class="btn btn-primary">Построить новый</router-link>
    </div>

    <template v-else>
      <div class="card border-0 shadow-sm mb-3 bg-primary text-white">
        <div class="card-body p-4 text-center">
          <i :class="directionIcon" style="font-size: 64px;"></i>
          <h3 class="fw-bold mt-3">{{ currentStep?.instruction || 'Двигайтесь по маршруту' }}</h3>
          <div class="opacity-75 mt-2">
            Этаж {{ currentStep?.floor }}
            <span v-if="currentStep?.distance"> · {{ currentStep.distance }} м</span>
          </div>
        </div>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between small mb-2">
            <span>Прогресс</span>
            <span>{{ routeStore.stepIndex + 1 }} / {{ routeStore.current.steps.length }}</span>
          </div>
          <div class="progress" style="height: 8px;">
            <div class="progress-bar bg-primary" :style="{ width: routeStore.progress + '%' }"></div>
          </div>
        </div>
      </div>

      <RouteControls
          :can-prev="routeStore.stepIndex > 0"
          @prev="routeStore.prevStep"
          @next="routeStore.nextStep"
          @finish="finish"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import { useHistoryStore } from '@/stores/historyStore';
import RouteControls from '@/components/route/RouteControls.vue';

const icons: Record<string, string> = {
  straight: 'bi-arrow-up-circle',
  left: 'bi-arrow-left-circle',
  right: 'bi-arrow-right-circle',
  up: 'bi-arrow-up-circle-fill',
  down: 'bi-arrow-down-circle-fill',
};

export default defineComponent({
  name: 'NavigationView',
  components: { RouteControls },
  props: { id: { type: String, default: '' } },
  setup() {
    const routeStore = useRouteStore();
    const history = useHistoryStore();
    const router = useRouter();

    const currentStep = computed(() => routeStore.currentStep);
    const directionIcon = computed(() =>
        currentStep.value ? icons[currentStep.value.direction] || 'bi-geo-alt' : 'bi-geo-alt'
    );

    async function finish() {
      if (routeStore.current) {
        // Используем objectId из текущей цели маршрута, если есть, иначе 0
        const targetNode = routeStore.current.nodes[routeStore.current.nodes.length - 1];
        const node = routeStore.current.steps.find(s => s.nodeId === targetNode);
        // В упрощенном варианте просто логируем факт навигации
        await history.add({ objectId: 0, action: 'start_navigation' });
      }
      routeStore.stopNavigation();
      router.push('/');
    }

    onMounted(() => routeStore.startNavigation());
    onUnmounted(() => routeStore.stopNavigation());

    return { routeStore, currentStep, directionIcon, finish };
  },
});
</script>