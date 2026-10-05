<template>
  <div class="container py-3">
    <Loading v-if="loading" text="Загрузка объекта..." />
    <ErrorState v-else-if="error" :message="error" retry @retry="load" />
    <template v-else-if="object">
      <div class="d-flex align-items-center gap-2 mb-3">
        <router-link to="/" class="btn btn-light btn-sm rounded-circle"><i class="bi bi-arrow-left"></i></router-link>
        <h4 class="fw-bold mb-0">{{ object.name }}</h4>
      </div>

      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body p-0">
          <div class="bg-light d-flex align-items-center justify-content-center" style="height: 200px;">
            <i class="bi bi-building text-muted" style="font-size: 64px;"></i>
          </div>
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge bg-primary-subtle text-primary me-1">{{ typeLabel }}</span>
                <span class="badge bg-light text-dark border">Этаж {{ object.floor }}</span>
                <span v-if="object.roomNumber" class="badge bg-light text-dark border ms-1">№{{ object.roomNumber }}</span>
              </div>
              <button class="btn btn-sm" :class="isFav ? 'btn-warning' : 'btn-outline-secondary'" @click="toggleFav">
                <i :class="isFav ? 'bi-bookmark-fill' : 'bi-bookmark'"></i>
              </button>
            </div>
            <p class="text-muted mb-3">{{ object.description }}</p>
            <ObjectTags :tags="object.tags" />
          </div>
        </div>
      </div>

      <div v-if="object.availability.schedule" class="card border-0 shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="small text-muted">Часы доступности</div>
          <div class="fw-semibold">{{ object.availability.schedule }}</div>
        </div>
      </div>

      <div v-if="object.equipment?.length" class="card border-0 shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="small text-muted mb-2">Оборудование</div>
          <div class="d-flex flex-wrap gap-1">
            <span v-for="e in object.equipment" :key="e" class="badge bg-light text-dark border">{{ e }}</span>
          </div>
        </div>
      </div>

      <div v-if="object.researchTopic" class="card border-0 shadow-sm mb-3">
        <div class="card-body p-3">
          <div class="small text-muted">Научная тематика</div>
          <div>{{ object.researchTopic }}</div>
        </div>
      </div>

      <div class="d-grid gap-2">
        <router-link :to="`/route?to=${object.id}`" class="btn btn-primary btn-lg">
          <i class="bi bi-signpost-split me-2"></i>Построить маршрут
        </router-link>
        <router-link to="/map" class="btn btn-outline-primary">Открыть на карте</router-link>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted, ref } from 'vue';
import { useRoute as useVueRoute } from 'vue-router';
import { useObjectStore } from '@/stores/objectStore';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useHistoryStore } from '@/stores/historyStore';
import Loading from '@/components/common/Loading.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import ObjectTags from '@/components/object/ObjectTags.vue';

const typeLabels: Record<string, string> = {
  classroom: 'Аудитория', lab: 'Лаборатория', office: 'Кабинет',
  department: 'Кафедра', stairs: 'Лестница', entrance: 'Вход', info: 'Инфо-точка',
};

export default defineComponent({
  name: 'ObjectView',
  components: { Loading, ErrorState, ObjectTags },
  props: { id: { type: String, required: true } },
  setup(props) {
    const route = useVueRoute();
    const objects = useObjectStore();
    const favorites = useFavoriteStore();
    const history = useHistoryStore();
    const loading = ref(false);
    const error = ref<string | null>(null);

    const object = computed(() => objects.current);
    const typeLabel = computed(() => object.value ? typeLabels[object.value.type] || object.value.type : '');
    const isFav = computed(() => object.value ? favorites.has(object.value.id) : false);

    async function load() {
      loading.value = true; error.value = null;
      try {
        await objects.loadById(+props.id);
        await favorites.load();
        if (objects.current) await history.add({ objectId: objects.current.id, action: 'view_object' });
      } catch (e: any) { error.value = e.message; }
      finally { loading.value = false; }
    }

    async function toggleFav() {
      if (!object.value) return;
      if (isFav.value) await favorites.remove(object.value.id);
      else { await favorites.add(object.value.id); await history.add({ objectId: object.value.id, action: 'favorite' }); }
    }

    onMounted(load);
    return { object, typeLabel, isFav, loading, error, load, toggleFav };
  },
});
</script>