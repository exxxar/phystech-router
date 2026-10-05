<template>
  <div class="toast-container position-fixed top-0 end-0 p-3" style="z-index: 1100;">
    <div
        v-for="notification in notifications"
        :key="notification.id"
        class="toast show"
        :class="toastClass(notification.type)"
        role="alert"
    >
      <div class="toast-header">
        <i :class="toastIcon(notification.type)" class="me-2"></i>
        <strong class="me-auto">{{ notificationTitle(notification.type) }}</strong>
        <button
            type="button"
            class="btn-close"
            @click="remove(notification.id)"
        ></button>
      </div>
      <div class="toast-body">
        {{ notification.message }}
      </div>
    </div>
  </div>
</template>

<script>
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'ToastContainer',
  setup() {
    const { notifications, removeNotification } = useNotification();
    return { notifications, remove: removeNotification };
  },
  methods: {
    toastClass(type) {
      return {
        success: 'text-bg-success',
        error: 'text-bg-danger',
        warning: 'text-bg-warning',
        info: 'text-bg-info'
      }[type] || 'text-bg-secondary';
    },
    toastIcon(type) {
      return {
        success: 'bi bi-check-circle-fill',
        error: 'bi bi-x-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        info: 'bi bi-info-circle-fill'
      }[type] || 'bi bi-bell-fill';
    },
    notificationTitle(type) {
      return {
        success: 'Успешно',
        error: 'Ошибка',
        warning: 'Предупреждение',
        info: 'Информация'
      }[type] || 'Уведомление';
    }
  }
};
</script>