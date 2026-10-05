<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <div class="row text-center g-2">
        <div class="col-4">
          <div class="small text-muted">Расстояние</div>
          <div class="fw-semibold">{{ route.distance }} м</div>
        </div>
        <div class="col-4">
          <div class="small text-muted">Время</div>
          <div class="fw-semibold">{{ route.duration }} мин</div>
        </div>
        <div class="col-4">
          <div class="small text-muted">Переходов</div>
          <div class="fw-semibold">{{ route.steps.length }}</div>
        </div>
      </div>
      <div class="mt-3 small text-muted">
        Этажи: {{ route.floors.join(' → ') }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Route } from '@/types';
export default defineComponent({
  name: 'RouteSummary',
  props: { route: { type: Object as () => Route, required: true } },
});
</script>