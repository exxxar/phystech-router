<template>
  <header class="app-header bg-white border-bottom sticky-top">
    <div class="container-fluid d-flex align-items-center py-2 px-3">
      <!-- Кнопка гамбургер (видна только на мобильных и планшетах) -->
      <button
          class="btn btn-light d-lg-none me-2 rounded-circle"
          type="button"
          data-bs-toggle="offcanvas"
          data-bs-target="#mobileMenu"
          aria-label="Открыть меню"
          style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;"
      >
        <i class="bi bi-list fs-4"></i>
      </button>

      <router-link to="/" class="d-flex align-items-center text-decoration-none">
        <i class="bi bi-geo-alt-fill text-primary me-2 fs-4"></i>
        <span class="fw-semibold text-dark">Кафедра КТ</span>
      </router-link>

      <div class="ms-auto d-flex align-items-center gap-2">
        <router-link to="/search" class="btn btn-light btn-sm rounded-circle" aria-label="Поиск" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-search fs-5"></i>
        </router-link>
        <router-link to="/profile" class="btn btn-light btn-sm rounded-circle" aria-label="Профиль" style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <i class="bi bi-person fs-5"></i>
        </router-link>
      </div>
    </div>
  </header>

  <!-- Выдвижное мобильное меню (Bootstrap 5 Offcanvas) -->
  <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileMenu" aria-labelledby="mobileMenuLabel">
    <div class="offcanvas-header border-bottom">
      <h5 class="offcanvas-title fw-bold" id="mobileMenuLabel">Меню</h5>
      <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Закрыть"></button>
    </div>
    <div class="offcanvas-body p-0">
      <div class="list-group list-group-flush">
        <router-link to="/" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-house-door me-3 text-primary fs-5" style="width: 24px; text-align: center;"></i>
          <span class="fw-medium">Главная</span>
        </router-link>
        <router-link to="/map" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-map me-3 text-primary fs-5" style="width: 24px; text-align: center;"></i>
          <span class="fw-medium">Карта</span>
        </router-link>
        <router-link to="/search" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-search me-3 text-primary fs-5" style="width: 24px; text-align: center;"></i>
          <span class="fw-medium">Поиск</span>
        </router-link>
        <router-link to="/route" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-signpost-split me-3 text-primary fs-5" style="width: 24px; text-align: center;"></i>
          <span class="fw-medium">Построить маршрут</span>
        </router-link>

        <hr class="my-2 text-muted" />

        <router-link to="/recommendations" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-stars me-3 text-secondary fs-5" style="width: 24px; text-align: center;"></i>
          <span>Рекомендации</span>
        </router-link>
        <router-link to="/favorites" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-bookmark me-3 text-secondary fs-5" style="width: 24px; text-align: center;"></i>
          <span>Избранное</span>
        </router-link>
        <router-link to="/history" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-clock-history me-3 text-secondary fs-5" style="width: 24px; text-align: center;"></i>
          <span>История</span>
        </router-link>

        <hr class="my-2 text-muted" />

        <router-link to="/settings" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-gear me-3 text-secondary fs-5" style="width: 24px; text-align: center;"></i>
          <span>Настройки</span>
        </router-link>
        <router-link to="/about" class="list-group-item list-group-item-action d-flex align-items-center py-3" data-bs-dismiss="offcanvas">
          <i class="bi bi-info-circle me-3 text-secondary fs-5" style="width: 24px; text-align: center;"></i>
          <span>О приложении</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppHeader'
});
</script>

<style scoped>
.app-header {
  box-shadow: 0 1px 2px rgba(23, 43, 77, 0.05);
  z-index: 1040;
}

/* Стилизация активного пункта в мобильном меню */
.list-group-item-action.active,
.list-group-item-action.router-link-active {
  background-color: #172B4D;
  border-color: #172B4D;
  color: white;
}

.list-group-item-action.router-link-active i {
  color: white !important;
}

/* Убираем стандартный серый фон при нажатии на мобильных, заменяем на наш */
.list-group-item-action:active {
  background-color: #334E68;
  color: white;
}
</style>