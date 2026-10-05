<template>
  <div class="d-flex gap-2 flex-wrap">
    <button class="btn btn-outline-secondary flex-grow-1" @click="$emit('prev')" :disabled="!canPrev">
      <i class="bi bi-chevron-left me-1"></i> Назад
    </button>
    <button class="btn btn-primary flex-grow-1" @click="$emit('next')">
      Далее <i class="bi bi-chevron-right ms-1"></i>
    </button>
    <button class="btn btn-outline-danger" @click="$emit('finish')">
      <i class="bi bi-x-circle me-1"></i> Завершить
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RouteControls',
  props: {
    canPrev: { type: Boolean, default: false }
  },
  emits: ['prev', 'next', 'finish'],
});
</script>