<template>
  <nav class="bottom-nav">
    <div class="nav-container">
      <router-link
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActive(item) }"
      >
        <div class="nav-icon-wrapper">
          <i :class="item.icon"></i>
          <div v-if="isActive(item)" class="active-indicator"></div>
        </div>
        <span class="nav-label">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useRoute } from 'vue-router';

export default defineComponent({
  name: 'AppBottomNavigation',
  setup() {
    const route = useRoute();

    const navItems = [
      { to: '/', icon: 'bi-house-door-fill', label: 'Главная', routes: ['home'] },
      { to: '/map', icon: 'bi-map-fill', label: 'Карта', routes: ['map'] },
      { to: '/route', icon: 'bi-signpost-split-fill', label: 'Маршрут', routes: ['route-create', 'route-view', 'navigation'] },
      { to: '/favorites', icon: 'bi-bookmark-fill', label: 'Избранное', routes: ['favorites'] },
      { to: '/profile', icon: 'bi-person-fill', label: 'Профиль', routes: ['profile', 'settings', 'about'] },
    ];

    const isActive = (item: any) => {
      if (item.routes.includes(route.name as string)) return true;
      if (item.to === '/' && route.name === 'home') return true;
      return false;
    };

    return { navItems, isActive };
  },
});
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1030;
  background: white;
  box-shadow: 0 -2px 12px rgba(23, 43, 77, 0.08);
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 500px;
  margin: 0 auto;
  padding: 8px 0;
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: #6B7280;
  padding: 8px 4px;
  min-height: 56px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 4px;
}

.nav-item i {
  font-size: 22px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.active-indicator {
  position: absolute;
  top: -8px;
  width: 32px;
  height: 3px;
  background: #172B4D;
  border-radius: 0 0 3px 3px;
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
    opacity: 0;
  }
  to {
    transform: scaleX(1);
    opacity: 1;
  }
}

.nav-item.active {
  color: #172B4D;
}

.nav-item.active i {
  transform: translateY(-2px);
  font-size: 24px;
}

.nav-item.active .nav-label {
  font-weight: 600;
  transform: translateY(1px);
}

.nav-item:active {
  transform: scale(0.95);
}

/* Hover эффект для планшетов */
@media (hover: hover) {
  .nav-item:hover {
    color: #334E68;
  }

  .nav-item:hover i {
    transform: translateY(-1px);
  }
}
</style>