<template>
  <div class="container py-3">
    <div class="d-flex align-items-center gap-2 mb-3">
      <router-link to="/route" class="btn btn-light btn-sm rounded-circle"><i class="bi bi-arrow-left"></i></router-link>
      <h4 class="fw-bold mb-0">Маршрут</h4>
    </div>

    <div v-if="route" class="mb-3">
      <MapView
          :visibleNodes="visibleNodes"
          :selectedNode="null"
          :position="null"
          :routeNodes="route.nodes"
          :objects="objects.objects"
      />
    </div>

    <RouteSummary v-if="route" :route="route" class="mb-3" />

    <h6 class="fw-bold mb-2">Основные точки</h6>
    <RouteSteps v-if="route" :steps="route.steps" />

    <div class="d-grid gap-2 mt-3">
      <router-link v-if="route" :to="`/navigation/${route.id}`" class="btn btn-primary btn-lg">
        <i class="bi bi-play-fill me-2"></i>Начать навигацию
      </router-link>
      <router-link to="/route" class="btn btn-outline-secondary">Изменить маршрут</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useRouteStore } from '@/stores/routeStore';
import { useObjectStore } from '@/stores/objectStore';
import { useMapStore } from '@/stores/mapStore';
import MapView from '@/components/map/MapView.vue';
import RouteSummary from '@/components/route/RouteSummary.vue';
import RouteSteps from '@/components/route/RouteSteps.vue';

export default defineComponent({
  name: 'RouteView',
  components: { MapView, RouteSummary, RouteSteps },
  props: { id: String },
  setup() {
    const routeStore = useRouteStore();
    const objects = useObjectStore();
    const map = useMapStore();
    const route = computed(() => routeStore.current);
    const visibleNodes = computed(() => {
      if (!route.value || !map.graph) return [];
      const ids = new Set(route.value.nodes);
      return map.graph.nodes.filter((n) => ids.has(n.id));
    });
    onMounted(() => { if (!map.graph) map.load(); });
    return { route, visibleNodes, objects };
  },
});
</script>