<template>
  <div class="card border-0 shadow-sm h-100">
    <div class="card-body p-3">
      <div class="fw-semibold mb-1">{{ object.name }}</div>
      <div class="small text-muted mb-2">{{ object.description }}</div>
      <div class="small text-primary fst-italic mb-3">
        <i class="bi bi-lightbulb me-1"></i>{{ reason }}
      </div>
      <router-link :to="`/objects/${object.id}`" class="btn btn-outline-primary btn-sm w-100">Открыть</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { DepartmentObject } from '@/types';
export default defineComponent({
  name: 'RecommendationCard',
  props: {
    object: { type: Object as () => DepartmentObject, required: true },
    reason: { type: String, required: true },
  },
});
</script>