<template>
  <div class="container py-3">
    <div class="d-flex align-items-center justify-content-between mb-3">
      <h4 class="fw-bold mb-0">Карта</h4>
      <div class="d-flex gap-2">
        <router-link to="/search" class="btn btn-light btn-sm rounded-circle" aria-label="Поиск">
          <i class="bi bi-search"></i>
        </router-link>
        <button class="btn btn-light btn-sm rounded-circle" aria-label="Моя позиция" @click="locate">
          <i class="bi bi-geo-alt"></i>
        </button>
      </div>
    </div>

    <FloorSwitcher :floors="map.floors" :current="map.currentFloor" @change="map.setFloor" />

    <div class="mt-3">
      <DepartmentMapView
          :visibleNodes="map.visibleNodes"
          :selectedNode="map.selectedNode"
          :position="map.currentPosition"
          :routeNodes="route.current?.nodes || []"
          :objects="objects.objects"
          :floorPlanUrl="map.activeFloor?.planUrl || ''"
          :width="map.activeFloor?.width || 1000"
          :height="map.activeFloor?.height || 600"
          @selectNode="onSelectNode"
      />
    </div>

    <div class="mt-2"><MapLegend /></div>

    <div v-if="selectedObject" class="card border-0 shadow-sm mt-3">
      <div class="card-body p-3">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <div class="fw-semibold">{{ selectedObject.name }}</div>
            <div class="small text-muted">{{ selectedObject.description }}</div>
          </div>
          <button class="btn btn-sm btn-light" @click="map.selectNode(null)"><i class="bi bi-x"></i></button>
        </div>
        <div class="d-flex gap-2 mt-2">
          <router-link :to="`/objects/${selectedObject.id}`" class="btn btn-outline-primary btn-sm flex-grow-1">Подробнее</router-link>
          <router-link :to="`/route?to=${selectedObject.id}`" class="btn btn-primary btn-sm">Маршрут</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useMapStore } from '@/stores/mapStore';
import { useObjectStore } from '@/stores/objectStore';
import { useRouteStore } from '@/stores/routeStore';
import { useGeolocation } from '@/composables/useGeolocation';
import FloorSwitcher from '@/components/map/FloorSwitcher.vue';
import DepartmentMapView from '@/components/map/MapView.vue';
import MapLegend from '@/components/map/MapLegend.vue';

export default defineComponent({
  name: 'MapViewPage',
  components: { FloorSwitcher, DepartmentMapView, MapLegend },
  setup() {
    const map = useMapStore();
    const objects = useObjectStore();
    const route = useRouteStore();
    const geo = useGeolocation();

    const selectedObject = computed(() => {
      if (!map.selectedNode) return null;
      const node = map.graph?.nodes.find((n) => n.id === map.selectedNode);
      return node?.objectId ? objects.objects.find((o) => o.id === node.objectId) || null : null;
    });

    function onSelectNode(id: string) { map.selectNode(id); }

    onMounted(() => { if (!map.floors.length) map.load(); });

    return { map, objects, route, selectedObject, onSelectNode, locate: geo.request };
  },
});
</script>