<template>
  <div class="row g-3">
    <div v-for="obj in objects" :key="obj.id" class="col-12 col-md-6 col-xl-4">
      <ObjectCard :object="obj" />
    </div>
    <div v-if="objects.length === 0 && !loading" class="col-12">
      <EmptyState message="Ничего не найдено" icon="bi-search" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { DepartmentObject } from '@/types';
import ObjectCard from './ObjectCard.vue';
import EmptyState from '@/components/common/EmptyState.vue';
export default defineComponent({
  name: 'ObjectList',
  components: { ObjectCard, EmptyState },
  props: {
    objects: { type: Array as () => DepartmentObject[], default: () => [] },
    loading: Boolean,
  },
});
</script>