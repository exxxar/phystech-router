<template>
  <div class="container py-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-bold mb-0">История</h4>
      <button v-if="entries.length" class="btn btn-outline-danger btn-sm" @click="showConfirm = true">Очистить</button>
    </div>

    <Loading v-if="loading" />
    <EmptyState v-else-if="entries.length === 0" message="История пуста" icon="bi-clock-history" />

    <div v-else class="list-group">
      <div v-for="e in entries" :key="e.id" class="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div class="fw-semibold">{{ objectName(e.objectId) }}</div>
          <div class="small text-muted">{{ actionLabel(e.action) }} · {{ formatDate(e.createdAt) }}</div>
        </div>
        <router-link v-if="e.objectId" :to="`/objects/${e.objectId}`" class="btn btn-light btn-sm">
          <i class="bi bi-arrow-right"></i>
        </router-link>
      </div>
    </div>

    <ConfirmModal :show="showConfirm" title="Очистить историю?" message="Все записи будут удалены." @confirm="clear" @cancel="showConfirm = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useHistoryStore } from '@/stores/historyStore';
import { useObjectStore } from '@/stores/objectStore';
import Loading from '@/components/common/Loading.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ConfirmModal from '@/components/common/ConfirmModal.vue';

const actionLabels: Record<string, string> = {
  view_object: 'Просмотр', build_route: 'Маршрут', start_navigation: 'Навигация', favorite: 'Избранное',
};

export default defineComponent({
  name: 'HistoryView',
  components: { Loading, EmptyState, ConfirmModal },
  setup() {
    const history = useHistoryStore();
    const objects = useObjectStore();
    const showConfirm = ref(false);
    onMounted(async () => { await history.load(); if (!objects.objects.length) await objects.loadAll(); });
    const objectName = (id: number) => objects.objects.find((o) => o.id === id)?.name || 'Объект';
    const actionLabel = (a: string) => actionLabels[a] || a;
    const formatDate = (d: string) => new Date(d).toLocaleString('ru-RU');
    async function clear() { await history.clear(); showConfirm.value = false; }
    return { entries: history.entries, loading: history.loading, objectName, actionLabel, formatDate, clear, showConfirm };
  },
});
</script>