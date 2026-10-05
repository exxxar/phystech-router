<template>
  <div id="admin-app">
    <!-- Глобальный индикатор восстановления сессии -->
    <div v-if="isRestoring" class="app-loading-overlay">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <!-- Основной контент -->
    <template v-else>
      <!-- Для страницы логина используем AuthLayout -->
      <AuthLayout v-if="isAuthRoute">
        <router-view />
      </AuthLayout>

      <!-- Для всех остальных маршрутов layout определяется вложенными routes -->
      <router-view v-else />
    </template>

    <!-- Глобальные уведомления (на верхнем уровне, работают везде) -->
    <ToastContainer />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import AuthLayout from '@/layouts/AuthLayout.vue';
import ToastContainer from '@/components/common/ToastContainer.vue';

export default {
  name: 'App',
  components: {
    AuthLayout,
    ToastContainer
  },
  computed: {
    ...mapState(useAuthStore, ['isRestoring']),
    isAuthRoute() {
      return this.$route?.meta?.layout === 'AuthLayout';
    }
  },
  async created() {
    // Восстанавливаем сессию при первом рендере
    await this.restoreSession();
  },
  methods: {
    ...mapActions(useAuthStore, ['restoreSession'])
  }
};
</script>

<style>
/* Глобальный overlay при восстановлении сессии */
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>