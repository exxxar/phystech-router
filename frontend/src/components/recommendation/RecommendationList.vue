<template>
  <div class="row g-3">
    <div v-for="rec in enriched" :key="rec.objectId" class="col-12 col-md-6 col-xl-4">
      <RecommendationCard v-if="rec.object" :object="rec.object" :reason="rec.reason" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { Recommendation, DepartmentObject } from '@/types';
import RecommendationCard from './RecommendationCard.vue';
export default defineComponent({
  name: 'RecommendationList',
  components: { RecommendationCard },
  props: {
    recommendations: { type: Array as () => Recommendation[], default: () => [] },
    objects: { type: Array as () => DepartmentObject[], default: () => [] },
  },
  setup(props) {
    const enriched = computed(() =>
        props.recommendations
            .map((r) => ({ ...r, object: props.objects.find((o) => o.id === r.objectId) }))
            .filter((r) => r.object),
    );
    return { enriched };
  },
});
</script>