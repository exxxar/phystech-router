<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Построение маршрута</h4>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body p-3">
        <label class="small text-muted">Откуда</label>
        <select class="form-select" v-model="from">
          <option value="n_entrance">Главный вход</option>
          <option v-for="n in nodes" :key="n.id" :value="n.id">{{ nodeLabel(n) }}</option>
        </select>
      </div>
    </div>

    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body p-3">
        <label class="small text-muted">Куда</label>
        <select class="form-select" v-model="to">
          <option value="" disabled>Выберите объект</option>
          <option v-for="o in objects.objects" :key="o.id" :value="nodeFor(o.id)">{{ o.name }}</option>
        </select>
      </div>
    </div>

    <div v-if="error" class="alert alert-warning small">{{ error }}</div>

    <button class="btn btn-primary btn-lg w-100" :disabled="!from || !to || loading" @click="build">
      <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
      Построить маршрут
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue';
import { useRoute as useVueRoute, useRouter } from 'vue-router';
import { useRouteStore } from '@/stores/routeStore';
import { useObjectStore } from '@/stores/objectStore';
import { useMapStore } from '@/stores/mapStore';
import { useHistoryStore } from '@/stores/historyStore';

export default defineComponent({
  name: 'RouteCreateView',
  setup() {
    const routeStore = useRouteStore();
    const objects = useObjectStore();
    const map = useMapStore();
    const history = useHistoryStore();
    const vueRoute = useVueRoute();
    const router = useRouter();

    const from = ref('n_entrance');
    const to = ref<string>((vueRoute.query.to as string) ? `n_${vueRoute.query.to}` : '');
    const loading = ref(false);
    const error = ref<string | null>(null);

    const nodes = computed(() => map.graph?.nodes.filter((n) => n.type !== 'room') || []);

    function nodeLabel(n: any) {
      if (n.objectId) {
        const o = objects.objects.find((x) => x.id === n.objectId);
        return o ? o.name : n.id;
      }
      return n.id;
    }
    function nodeFor(objectId: number) {
      const n = map.graph?.nodes.find((x) => x.objectId === objectId);
      return n?.id || '';
    }

    async function build() {
      loading.value = true; error.value = null;
      try {
        await routeStore.build(from.value, to.value);
        if (routeStore.current) {
          await history.add({ objectId: +to.value.replace('n_', ''), action: 'build_route' });
          router.push(`/route/${routeStore.current.id}`);
        }
      } catch (e: any) { error.value = e.message; }
      finally { loading.value = false; }
    }

    onMounted(async () => {
      if (!objects.objects.length) await objects.loadAll();
      if (!map.graph) await map.load();
    });

    return { from, to, nodes, loading, error, build, nodeLabel, nodeFor, objects };
  },
});
</script>