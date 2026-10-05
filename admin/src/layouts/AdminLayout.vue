<template>
  <div class="d-flex admin-wrapper">
    <!-- Overlay для мобильных -->
    <div
        class="sidebar-overlay"
        :class="{ show: sidebarOpen }"
        @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <nav
        class="sidebar bg-dark text-white d-flex flex-column flex-shrink-0 p-3"
        :class="{ show: sidebarOpen }"
        style="width: 250px;"
    >
      <div class="d-flex align-items-center justify-content-between mb-3">
        <router-link to="/dashboard" class="d-flex align-items-center text-white text-decoration-none">
          <i class="bi bi-building fs-4 me-2"></i>
          <span class="fs-5 fw-bold">Путеводитель</span>
        </router-link>
        <button
            class="btn btn-sm btn-outline-light d-lg-none"
            @click="toggleSidebar"
        >
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <hr class="text-white-50">

      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item" v-if="hasPermission('dashboard.view')">
          <router-link to="/dashboard" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </router-link>
        </li>
        <li v-if="hasPermission('floors.view')">
          <router-link to="/floors" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-layers me-2"></i>Этажи
          </router-link>
        </li>
        <li v-if="hasPermission('rooms.view')">
          <router-link to="/rooms" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-door-open me-2"></i>Помещения
          </router-link>
        </li>
        <li v-if="hasPermission('objects.view')">
          <router-link to="/objects" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-geo-alt me-2"></i>Объекты
          </router-link>
        </li>
        <li v-if="hasPermission('categories.view')">
          <router-link to="/categories" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-tags me-2"></i>Категории
          </router-link>
        </li>
        <li v-if="hasPermission('events.view')">
          <router-link to="/events" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-calendar-event me-2"></i>Мероприятия
          </router-link>
        </li>
        <li v-if="hasPermission('routes.view')">
          <router-link to="/routes" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-signpost-split me-2"></i>Маршруты
          </router-link>
        </li>
        <li v-if="hasPermission('graph.view')">
          <router-link to="/graph" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-diagram-3 me-2"></i>Граф
          </router-link>
        </li>
        <li v-if="hasPermission('media.view')">
          <router-link to="/media" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-images me-2"></i>Медиа
          </router-link>
        </li>
        <li v-if="hasPermission('users.view')">
          <router-link to="/users" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-people me-2"></i>Пользователи
          </router-link>
        </li>
        <li v-if="hasPermission('settings.view')">
          <router-link to="/settings" class="nav-link text-white" active-class="active" @click="closeSidebarOnMobile">
            <i class="bi bi-gear me-2"></i>Настройки
          </router-link>
        </li>
      </ul>

      <hr class="text-white-50">

      <div class="dropdown">
        <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" data-bs-toggle="dropdown">
          <i class="bi bi-person-circle me-2"></i>
          <strong>{{ userName }}</strong>
        </a>
        <ul class="dropdown-menu dropdown-menu-dark text-small shadow">
          <li><a class="dropdown-item" href="#" @click.prevent="handleLogout">
            <i class="bi bi-box-arrow-right me-2"></i>Выйти
          </a></li>
        </ul>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow-1 bg-light p-4 overflow-auto" style="height: 100vh;">
      <!-- Mobile header -->
      <div class="d-lg-none mb-3">
        <button class="btn btn-primary" @click="toggleSidebar">
          <i class="bi bi-list"></i> Меню
        </button>
      </div>

      <router-view></router-view>

    </main>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useAuthStore } from '@/stores/auth';


export default {
  name: 'AdminLayout',

  data() {
    return {
      sidebarOpen: false
    };
  },
  computed: {
    ...mapState(useAuthStore, ['user', 'permissions']),
    userName() {
      return this.user?.name || this.user?.email || 'Администратор';
    }
  },
  methods: {
    ...mapActions(useAuthStore, ['logout']),
    handleLogout() {
      this.logout();
      this.$router.push('/login');
    },
    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    },
    closeSidebarOnMobile() {
      if (window.innerWidth < 992) {
        this.sidebarOpen = false;
      }
    },
    hasPermission(permission) {
      // Если permissions пустой или пользователь администратор — показываем всё
      if (!this.permissions || this.permissions.length === 0) return true;
      if (this.user?.role === 'administrator') return true;
      return this.permissions.includes(permission);
    }
  }
};
</script>

<style scoped>
.sidebar .nav-link.active {
  background-color: #0d6efd !important;
}
.sidebar .nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>