<template>
  <div v-if="isOffline" class="offline-alert bg-warning text-dark px-3 py-2 small d-flex align-items-center">
    <i class="bi bi-wifi-off me-2"></i>
    Нет подключения к сети. Используются сохранённые данные.
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useOffline } from '@/composables/useOffline';
export default defineComponent({
  name: 'OfflineAlert',
  setup() { return useOffline(); },
});
</script>

<style scoped>
.offline-alert { border-bottom: 1px solid rgba(0,0,0,0.1); }
</style>