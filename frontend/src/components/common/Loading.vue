<template>
  <div class="d-flex flex-column align-items-center justify-content-center py-5" :class="{ 'min-vh-50': full }">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Загрузка...</span></div>
    <div v-if="text" class="text-muted mt-3 small">{{ text }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'Loading',
  props: { text: String, full: Boolean },
});
</script>