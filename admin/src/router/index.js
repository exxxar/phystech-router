import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/pages/auth/Login.vue'),
        meta: { requiresAuth: false, layout: 'AuthLayout' }
    },
    {
        path: '/',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/dashboard' },
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('@/pages/Dashboard.vue'),
                meta: { permission: 'dashboard.view' }
            },

            // Этажи
            {
                path: 'floors',
                name: 'FloorList',
                component: () => import('@/pages/floors/FloorList.vue'),
                meta: { permission: 'floors.view' }
            },
            {
                path: 'floors/create',
                name: 'FloorCreate',
                component: () => import('@/pages/floors/FloorEdit.vue'),
                meta: { permission: 'floors.create' }
            },
            {
                path: 'floors/:id/edit',
                name: 'FloorEdit',
                component: () => import('@/pages/floors/FloorEdit.vue'),
                meta: { permission: 'floors.update' }
            },
            {
                path: 'floors/:id/map',
                name: 'FloorMap',
                component: () => import('@/pages/floors/FloorMap.vue'),
                meta: { permission: 'floors.map' }
            },

            // Помещения
            {
                path: 'rooms',
                name: 'RoomList',
                component: () => import('@/pages/rooms/RoomList.vue'),
                meta: { permission: 'rooms.view' }
            },
            {
                path: 'rooms/create',
                name: 'RoomCreate',
                component: () => import('@/pages/rooms/RoomEdit.vue'),
                meta: { permission: 'rooms.create' }
            },
            {
                path: 'rooms/:id/edit',
                name: 'RoomEdit',
                component: () => import('@/pages/rooms/RoomEdit.vue'),
                meta: { permission: 'rooms.update' }
            },

            // Объекты
            {
                path: 'objects',
                name: 'ObjectList',
                component: () => import('@/pages/objects/ObjectList.vue'),
                meta: { permission: 'objects.view' }
            },
            {
                path: 'objects/create',
                name: 'ObjectCreate',
                component: () => import('@/pages/objects/ObjectEdit.vue'),
                meta: { permission: 'objects.create' }
            },
            {
                path: 'objects/:id/edit',
                name: 'ObjectEdit',
                component: () => import('@/pages/objects/ObjectEdit.vue'),
                meta: { permission: 'objects.update' }
            },

            // Категории
            {
                path: 'categories',
                name: 'CategoryList',
                component: () => import('@/pages/categories/CategoryList.vue'),
                meta: { permission: 'categories.view' }
            },

            // Мероприятия
            {
                path: 'events',
                name: 'EventList',
                component: () => import('@/pages/events/EventList.vue'),
                meta: { permission: 'events.view' }
            },
            {
                path: 'events/create',
                name: 'EventCreate',
                component: () => import('@/pages/events/EventEdit.vue'),
                meta: { permission: 'events.create' }
            },
            {
                path: 'events/:id/edit',
                name: 'EventEdit',
                component: () => import('@/pages/events/EventEdit.vue'),
                meta: { permission: 'events.update' }
            },

            // Граф и маршруты
            {
                path: 'graph',
                name: 'GraphEditor',
                component: () => import('@/pages/graph/GraphEditor.vue'),
                meta: { permission: 'graph.view' }
            },
            {
                path: 'routes',
                name: 'RouteManager',
                component: () => import('@/pages/routes/RouteManager.vue'),
                meta: { permission: 'routes.view' }
            },

            // Медиа
            {
                path: 'media',
                name: 'MediaLibrary',
                component: () => import('@/pages/media/MediaLibrary.vue'),
                meta: { permission: 'media.view' }
            },

            // Пользователи
            {
                path: 'users',
                name: 'UserList',
                component: () => import('@/pages/users/UserList.vue'),
                meta: { permission: 'users.view' }
            },

            // Настройки
            {
                path: 'settings',
                name: 'Settings',
                component: () => import('@/pages/settings/Settings.vue'),
                meta: { permission: 'settings.view' }
            }
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        redirect: '/dashboard'
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();

    // Если сессия ещё восстанавливается — ждём
    if (authStore.isRestoring) {
        // Можно показать спиннер или просто подождать
        // В нашем случае App.vue сам показывает overlay
    }

    // Проверка авторизации
    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
        return;
    }

    // Редирект авторизованного пользователя с /login
    if (to.path === '/login' && authStore.isAuthenticated) {
        next('/dashboard');
        return;
    }

    // Проверка прав доступа
    if (to.meta.permission && authStore.isAuthenticated) {
        if (!authStore.hasPermission(to.meta.permission)) {
            console.warn(`Доступ запрещён: ${to.meta.permission}`);
            next('/dashboard');
            return;
        }
    }

    next();
});

function checkPermission(user, permissions, requiredPermission) {
    // Администратор имеет доступ ко всему
    if (user?.role === 'administrator') return true;

    // Если permissions пустой — разрешаем (для обратной совместимости)
    if (!permissions || permissions.length === 0) return true;

    return permissions.includes(requiredPermission);
}

export default router;