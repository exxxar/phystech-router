<template>
  <div class="text-center py-5">
    <i class="bi bi-exclamation-triangle" style="font-size: 48px; color: #B42318;"></i>
    <div class="mt-3 fw-semibold">Что-то пошло не так</div>
    <div class="text-muted small mt-1">{{ message }}</div>
    <div class="mt-3 d-flex gap-2 justify-content-center flex-wrap">
      <button v-if="retry" class="btn btn-primary btn-sm" @click="$emit('retry')">Повторить</button>
      <router-link to="/" class="btn btn-outline-secondary btn-sm">На главную</router-link>
      <router-link to="/map" class="btn btn-outline-secondary btn-sm">Открыть карту</router-link>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ErrorState',
  props: { message: String, retry: Boolean },
  emits: ['retry'],
});
</script>