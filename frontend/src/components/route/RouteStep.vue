<template>
  <div class="route-step d-flex gap-3 p-3 border rounded-3 mb-2" :class="{ 'border-primary bg-primary-subtle': active }">
    <div class="step-icon d-flex align-items-center justify-content-center rounded-circle bg-primary text-white" style="width:44px;height:44px;flex-shrink:0;">
      <i :class="directionIcon"></i>
    </div>
    <div class="flex-grow-1">
      <div class="fw-semibold">{{ step.instruction }}</div>
      <div class="small text-muted">
        Шаг {{ step.order }} · Этаж {{ step.floor }}
        <span v-if="step.distance"> · {{ step.distance }} м</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { RouteStep } from '@/types';
const icons: Record<string, string> = {
  straight: 'bi-arrow-up', left: 'bi-arrow-left', right: 'bi-arrow-right',
  up: 'bi-arrow-up-circle', down: 'bi-arrow-down-circle',
};
export default defineComponent({
  name: 'RouteStep',
  props: { step: { type: Object as () => RouteStep, required: true }, active: Boolean },
  setup(props) {
    const directionIcon = computed(() => icons[props.step.direction] || 'bi-geo-alt');
    return { directionIcon };
  },
});
</script>