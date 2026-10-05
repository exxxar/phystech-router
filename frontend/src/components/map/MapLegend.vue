<template>
  <div class="map-legend d-flex flex-wrap gap-3 small text-muted">
    <span><span class="dot bg-white border"></span> Помещение</span>
    <span><span class="dot bg-secondary"></span> Лестница</span>
    <span><span class="dot bg-success"></span> Вход</span>
    <span><span class="dot bg-primary"></span> Вы здесь</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'MapLegend' });
</script>

<style scoped>
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 4px; vertical-align: middle; }
</style>