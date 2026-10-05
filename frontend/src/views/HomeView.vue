<template>
  <div class="container py-3">
    <!-- Приветствие -->
    <div class="d-flex align-items-center justify-content-between mb-3">
      <div>
        <div class="text-muted small">Добро пожаловать</div>
        <h4 class="mb-0 fw-bold">{{ user?.name || 'Гость' }}</h4>
      </div>
      <router-link to="/profile" class="btn btn-light rounded-circle" aria-label="Профиль">
        <i class="bi bi-person-fill"></i>
      </router-link>
    </div>

    <!-- Поиск -->
    <router-link to="/search" class="text-decoration-none">
      <div class="card border-0 shadow-sm mb-3">
        <div class="card-body d-flex align-items-center p-3">
          <i class="bi bi-search text-muted me-3 fs-5"></i>
          <span class="text-muted">Куда вы хотите попасть?</span>
        </div>
      </div>
    </router-link>

    <!-- Быстрые действия -->
    <div class="row g-2 mb-3">
      <div v-for="a in quickActions" :key="a.to" class="col-6 col-md-3">
        <router-link :to="a.to" class="text-decoration-none">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center p-3">
              <i :class="a.icon" class="text-primary fs-3"></i>
              <div class="small fw-semibold mt-2">{{ a.label }}</div>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <!-- Текущая позиция -->
    <div class="card border-0 shadow-sm mb-3">
      <div class="card-body p-3">
        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="small text-muted">Вы сейчас здесь</div>
            <div class="fw-semibold">{{ currentPositionLabel }}</div>
          </div>
          <button class="btn btn-outline-primary btn-sm" @click="locate">
            <i class="bi bi-geo-alt me-1"></i>Определить
          </button>
        </div>
      </div>
    </div>

    <!-- Рекомендации -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0">Рекомендуем вам</h6>
      <router-link to="/recommendations" class="small text-primary text-decoration-none">Все →</router-link>
    </div>
    <div class="row g-2 mb-3">
      <div v-for="rec in topRecommendations" :key="rec.objectId" class="col-12 col-md-6 col-lg-4">
        <RecommendationCard v-if="rec.object" :object="rec.object" :reason="rec.reason" />
      </div>
    </div>

    <!-- Недавние -->
    <div class="d-flex justify-content-between align-items-center mb-2">
      <h6 class="fw-bold mb-0">Недавние объекты</h6>
      <router-link to="/history" class="small text-primary text-decoration-none">История →</router-link>
    </div>
    <div class="row g-2">
      <div v-for="obj in recentObjects" :key="obj.id" class="col-12 col-md-6 col-lg-4">
        <ObjectCard :object="obj" />
      </div>
      <div v-if="recentObjects.length === 0" class="col-12">
        <div class="text-muted small text-center py-3">Пока ничего не просмотрено</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useObjectStore } from '@/stores/objectStore';
import { useRecommendationStore } from '@/stores/recommendationStore';
import { useHistoryStore } from '@/stores/historyStore';
import { useGeolocation } from '@/composables/useGeolocation';
import ObjectCard from '@/components/object/ObjectCard.vue';
import RecommendationCard from '@/components/recommendation/RecommendationCard.vue';

export default defineComponent({
  name: 'HomeView',
  components: { ObjectCard, RecommendationCard },
  setup() {
    const user = useUserStore();
    const objects = useObjectStore();
    const recommendations = useRecommendationStore();
    const history = useHistoryStore();
    const geo = useGeolocation();

    const quickActions = [
      { to: '/map', icon: 'bi-map', label: 'Карта' },
      { to: '/search', icon: 'bi-search', label: 'Найти аудиторию' },
      { to: '/route', icon: 'bi-signpost-split', label: 'Маршрут' },
      { to: '/favorites', icon: 'bi-bookmark', label: 'Избранное' },
    ];

    const topRecommendations = computed(() =>
        recommendations.items.slice(0, 3).map((r) => ({ ...r, object: objects.objects.find((o) => o.id === r.objectId) })).filter((r) => r.object),
    );

    const recentObjects = computed(() => {
      const ids = history.entries.filter((e) => e.action === 'view_object').slice(0, 3).map((e) => e.objectId);
      return ids.map((id) => objects.objects.find((o) => o.id === id)).filter(Boolean) as any[];
    });

    const currentPositionLabel = computed(() => geo.latitude.value ? 'Местоположение определено' : 'Не определено');

    onMounted(async () => {
      await Promise.all([objects.loadAll(), recommendations.load({}), history.load()]);
    });

    return { user: user.user, quickActions, topRecommendations, recentObjects, currentPositionLabel, locate: geo.request };
  },
});
</script>