<template>
  <div
      v-if="isVisible"
      class="modal fade show d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5);"
      @click.self="handleCancel"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="btn-close" @click="handleCancel"></button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="handleCancel">
            Отмена
          </button>
          <button
              type="button"
              class="btn"
              :class="confirmButtonClass"
              @click="handleConfirm"
              :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfirmModal',
  props: {
    isVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'Подтверждение'
    },
    message: {
      type: String,
      default: 'Вы уверены?'
    },
    confirmText: {
      type: String,
      default: 'Подтвердить'
    },
    confirmButtonClass: {
      type: String,
      default: 'btn-danger'
    },
    isLoading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['confirm', 'cancel'],
  methods: {
    handleConfirm() {
      this.$emit('confirm');
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
};
</script>