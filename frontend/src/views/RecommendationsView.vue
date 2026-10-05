<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Рекомендации для вас</h4>
    <Loading v-if="loading" />
    <EmptyState v-else-if="items.length === 0" message="Пока нет рекомендаций" icon="bi-stars" />
    <RecommendationList v-else :recommendations="items" :objects="objects.objects" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useRecommendationStore } from '@/stores/recommendationStore';
import { useObjectStore } from '@/stores/objectStore';
import Loading from '@/components/common/Loading.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import RecommendationList from '@/components/recommendation/RecommendationList.vue';

export default defineComponent({
  name: 'RecommendationsView',
  components: { Loading, EmptyState, RecommendationList },
  setup() {
    const rec = useRecommendationStore();
    const objects = useObjectStore();
    onMounted(async () => { await rec.load({}); if (!objects.objects.length) await objects.loadAll(); });
    return { items: rec.items, loading: rec.loading, objects };
  },
});
</script>