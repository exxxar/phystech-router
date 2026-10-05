<template>
  <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center">
    <i class="bi bi-wifi-off text-muted" style="font-size: 80px;"></i>
    <h3 class="mt-3 fw-bold">Нет подключения</h3>
    <p class="text-muted">Проверьте соединение и попробуйте снова.</p>
    <button class="btn btn-primary" @click="reload">Повторить</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'OfflineView',
  setup() { return { reload: () => location.reload() }; },
});
</script>