<template>
  <div class="app-shell d-flex flex-column min-vh-100">
    <AppHeader v-if="!hideNav" />
    <main class="flex-grow-1 main-content">
      <OfflineAlert />
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <AppBottomNavigation v-if="!hideNav && isMobile" />
    <AppSidebar v-if="!hideNav && !isMobile" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNetworkStore } from '@/stores/networkStore';
import { useUserStore } from '@/stores/userStore';
import { useObjectStore } from '@/stores/objectStore';
import { useMapStore } from '@/stores/mapStore';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppBottomNavigation from '@/components/layout/AppBottomNavigation.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import OfflineAlert from '@/components/common/OfflineAlert.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { AppHeader, AppBottomNavigation, AppSidebar, OfflineAlert },
  setup() {
    const route = useRoute();
    const network = useNetworkStore();
    const user = useUserStore();
    const objects = useObjectStore();
    const map = useMapStore();

    const hideNav = computed(() => !!route.meta.hideNav);
    const isMobile = computed(() => window.innerWidth < 992);

    onMounted(() => {
      user.load();
      objects.loadAll();
      map.load();
      const updateOnline = () => network.setStatus(navigator.onLine ? 'online' : 'offline');
      window.addEventListener('online', updateOnline);
      window.addEventListener('offline', updateOnline);
    });

    return { hideNav, isMobile };
  },
});
</script>

<style scoped>
.app-shell { background: #F5F7FA; }
.main-content { padding-bottom: 80px; }
@media (min-width: 992px) { .main-content { padding-bottom: 0; padding-left: 240px; } }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>