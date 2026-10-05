<template>
  <div class="splash d-flex flex-column align-items-center justify-content-center min-vh-100 bg-primary text-white">
    <i class="bi bi-geo-alt-fill" style="font-size: 64px;"></i>
    <h1 class="mt-3 fw-bold">Путеводитель</h1>
    <p class="opacity-75">Кафедра компьютерных технологий</p>
    <div class="spinner-border mt-4" role="status"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import { useRouter } from 'vue-router';
export default defineComponent({
  name: 'SplashView',
  setup() {
    const router = useRouter();
    onMounted(() => {
      setTimeout(() => {
        const done = localStorage.getItem('onboarding_done');
        router.replace(done ? '/' : '/welcome');
      }, 1500);
    });
  },
});
</script>

<style scoped>
.bg-primary { background: #172B4D !important; }
</style>