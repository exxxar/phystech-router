<template>
  <div v-if="show" class="modal-backdrop-custom" @click.self="$emit('cancel')">
    <div class="modal-card bg-white rounded-3 p-4 shadow">
      <h5 class="mb-2">{{ title }}</h5>
      <p class="text-muted mb-3">{{ message }}</p>
      <div class="d-flex gap-2 justify-content-end">
        <button class="btn btn-outline-secondary btn-sm" @click="$emit('cancel')">Отмена</button>
        <button class="btn btn-primary btn-sm" @click="$emit('confirm')">Подтвердить</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ConfirmModal',
  props: { show: Boolean, title: String, message: String },
  emits: ['confirm', 'cancel'],
});
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed; inset: 0; background: rgba(16, 33, 61, 0.5); z-index: 2000;
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.modal-card { max-width: 400px; width: 100%; }
</style>