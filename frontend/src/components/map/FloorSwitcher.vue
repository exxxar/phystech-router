<template>
  <div class="floor-switcher d-flex gap-1 bg-white rounded-3 p-1 shadow-sm">
    <button
        v-for="f in floors" :key="f.id"
        class="floor-btn btn btn-sm flex-grow-1"
        :class="{ 'btn-primary': f.number === current, 'btn-light': f.number !== current }"
        @click="$emit('change', f.number)"
    >{{ f.number }}</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { Floor } from '@/types';
export default defineComponent({
  name: 'FloorSwitcher',
  props: { floors: { type: Array as () => Floor[], required: true }, current: { type: Number, required: true } },
  emits: ['change'],
});
</script>

<style scoped>
.floor-btn { min-height: 44px; font-weight: 600; }
</style>