<template>
  <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center p-4 text-center">
    <div class="text-primary fw-bold" style="font-size: 120px;">404</div>
    <h3 class="fw-bold">Страница не найдена</h3>
    <p class="text-muted">Запрошенная страница не существует.</p>
    <div class="d-flex gap-2 justify-content-center mt-3">
      <router-link to="/" class="btn btn-primary">На главную</router-link>
      <router-link to="/map" class="btn btn-outline-secondary">Открыть карту</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'NotFoundView'
});
</script>