<template>
  <aside class="app-sidebar d-none d-lg-flex flex-column bg-white border-end">
    <div class="p-3">
      <div class="text-muted small mb-3">Навигация</div>
      <router-link to="/" class="side-link"><i class="bi bi-house-door me-2"></i>Главная</router-link>
      <router-link to="/map" class="side-link"><i class="bi bi-map me-2"></i>Карта</router-link>
      <router-link to="/search" class="side-link"><i class="bi bi-search me-2"></i>Поиск</router-link>
      <router-link to="/route" class="side-link"><i class="bi bi-signpost-split me-2"></i>Маршрут</router-link>
      <router-link to="/recommendations" class="side-link"><i class="bi bi-stars me-2"></i>Рекомендации</router-link>
      <router-link to="/favorites" class="side-link"><i class="bi bi-bookmark me-2"></i>Избранное</router-link>
      <router-link to="/history" class="side-link"><i class="bi bi-clock-history me-2"></i>История</router-link>
      <hr />
      <router-link to="/profile" class="side-link"><i class="bi bi-person me-2"></i>Профиль</router-link>
      <router-link to="/settings" class="side-link"><i class="bi bi-gear me-2"></i>Настройки</router-link>
      <router-link to="/about" class="side-link"><i class="bi bi-info-circle me-2"></i>О приложении</router-link>
    </div>
  </aside>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'AppSidebar' });
</script>

<style scoped>
.app-sidebar {
  position: fixed; top: 0; left: 0; bottom: 0; width: 240px; padding-top: 60px;
  box-shadow: 1px 0 2px rgba(23, 43, 77, 0.05);
}
.side-link {
  display: block; padding: 10px 12px; color: #1F2937; text-decoration: none; border-radius: 8px;
  margin-bottom: 2px; font-size: 14px;
}
.side-link:hover { background: #F5F7FA; }
.side-link.router-link-active { background: #172B4D; color: white; }
</style>