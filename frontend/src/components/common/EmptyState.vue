<template>
  <div class="text-center py-5">
    <i class="bi" :class="icon" style="font-size: 48px; color: #6B7280;"></i>
    <div class="mt-3 text-muted">{{ message }}</div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'EmptyState',
  props: { message: String, icon: { type: String, default: 'bi-inbox' } },
});
</script>