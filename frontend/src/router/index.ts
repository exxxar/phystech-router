import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes = [
    // Публичные маршруты (не требуют авторизации)
    { path: '/splash', name: 'splash', component: () => import('@/views/SplashView.vue'), meta: { hideNav: true, requiresAuth: false } },
    { path: '/welcome', name: 'welcome', component: () => import('@/views/WelcomeView.vue'), meta: { hideNav: true, requiresAuth: false } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue'), meta: { hideNav: true, requiresAuth: false } },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue'), meta: { hideNav: true, requiresAuth: false } },

    // Защищенные маршруты
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
    { path: '/map', name: 'map', component: () => import('@/views/MapView.vue') },
    { path: '/search', name: 'search', component: () => import('@/views/SearchView.vue') },
    { path: '/objects/:id', name: 'object', component: () => import('@/views/ObjectView.vue'), props: true },
    { path: '/route', name: 'route-create', component: () => import('@/views/RouteCreateView.vue') },
    { path: '/route/:id', name: 'route-view', component: () => import('@/views/RouteView.vue'), props: true },
    { path: '/navigation/:id', name: 'navigation', component: () => import('@/views/NavigationView.vue'), props: true },
    { path: '/favorites', name: 'favorites', component: () => import('@/views/FavoritesView.vue') },
    { path: '/history', name: 'history', component: () => import('@/views/HistoryView.vue') },
    { path: '/recommendations', name: 'recommendations', component: () => import('@/views/RecommendationsView.vue') },
    { path: '/profile', name: 'profile', component: () => import('@/views/ProfileView.vue') },
    { path: '/settings', name: 'settings', component: () => import('@/views/SettingsView.vue') },
    { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
    { path: '/offline', name: 'offline', component: () => import('@/views/OfflineView.vue'), meta: { hideNav: true, requiresAuth: false } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/NotFoundView.vue'), meta: { hideNav: true, requiresAuth: false } },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0, left: 0 }),
});

// Глобальный навигационный хук (Guard)
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.meta.requiresAuth !== false; // По умолчанию все маршруты требуют авторизации

    // Если маршрут требует авторизации, а пользователь не вошел
    if (requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } });
    }
    // Если пользователь уже вошел и пытается открыть login/register/splash/welcome
    else if (authStore.isAuthenticated && ['login', 'register', 'splash', 'welcome'].includes(to.name as string)) {
        next({ name: 'home' });
    }
    // Если это первый визит и онбординг не пройден (но пользователь уже авторизован, например, после регистрации)
    else if (!localStorage.getItem('onboarding_done') && to.name !== 'welcome' && to.name !== 'register') {
        next({ name: 'welcome' });
    }
    else {
        next();
    }
});

export default router;