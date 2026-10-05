<template>
  <div>
    <RouteStep v-for="s in steps" :key="s.order" :step="s" :active="s.order === currentOrder" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { RouteStep } from '@/types';
import RouteStep from './RouteStep.vue';
export default defineComponent({
  name: 'RouteSteps',
  components: { RouteStep },
  props: {
    steps: { type: Array as () => RouteStep[], default: () => [] },
    currentOrder: Number,
  },
});
</script>