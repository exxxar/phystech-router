<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">О приложении</h4>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-4 text-center">
        <i class="bi bi-geo-alt-fill text-primary" style="font-size: 64px;"></i>
        <h5 class="fw-bold mt-3">Путеводитель по кафедре КТ</h5>
        <p class="text-muted">Версия 1.0.0</p>
        <p class="small text-muted">Интерактивный путеводитель по пространству кафедры компьютерных технологий. Построение маршрутов, персональные рекомендации, работа в offline.</p>
        <hr />
        <div class="small text-muted">
          Разработано в рамках исследования персонализированной пространственной навигации.
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'AboutView' });
</script>