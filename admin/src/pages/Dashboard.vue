<template>
  <div>
    <h1 class="mb-4">Dashboard</h1>

    <!-- Статистика -->
    <div class="row g-4 mb-4">
      <div class="col-md-3" v-for="stat in stats" :key="stat.label">
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <h6 class="text-muted mb-1">{{ stat.label }}</h6>
                <h3 class="mb-0">{{ stat.value }}</h3>
              </div>
              <i :class="stat.icon" class="fs-1 text-primary opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Состояние системы -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Состояние системы</h5>
          </div>
          <div class="card-body">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Доступность API
                <span class="badge" :class="systemStatus.api ? 'bg-success' : 'bg-danger'">
                  {{ systemStatus.api ? 'OK' : 'Ошибка' }}
                </span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Последнее обновление модели
                <span>{{ systemStatus.lastUpdate || '—' }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Опубликовано объектов
                <span class="badge bg-primary">{{ objectStats.published }}</span>
              </li>
              <li class="list-group-item d-flex justify-content-between align-items-center">
                Черновики
                <span class="badge bg-secondary">{{ objectStats.drafts }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Быстрые действия -->
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Быстрые действия</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <router-link to="/rooms/create" class="btn btn-outline-primary">
                <i class="bi bi-plus-circle me-2"></i>Добавить помещение
              </router-link>
              <router-link to="/objects/create" class="btn btn-outline-primary">
                <i class="bi bi-plus-circle me-2"></i>Добавить объект
              </router-link>
              <router-link to="/events/create" class="btn btn-outline-primary">
                <i class="bi bi-plus-circle me-2"></i>Добавить мероприятие
              </router-link>
              <router-link to="/graph" class="btn btn-outline-secondary">
                <i class="bi bi-diagram-3 me-2"></i>Открыть редактор графа
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useFloorStore } from '@/stores/floorStore';
import { useObjectStore } from '@/stores/objectStore';

export default {
  name: 'DashboardPage',
  data() {
    return {
      systemStatus: {
        api: true,
        lastUpdate: null
      }
    };
  },
  computed: {
    ...mapState(useFloorStore, { floors: 'items', floorsTotal: 'totalItems' }),
    ...mapState(useObjectStore, { objects: 'items', objectsTotal: 'totalItems', objectStats: 'stats' }),
    stats() {
      return [
        { label: 'Этажи', value: this.floorsTotal, icon: 'bi bi-layers' },
        { label: 'Объекты', value: this.objectsTotal, icon: 'bi bi-building' },
        { label: 'Опубликовано', value: this.objectStats.published, icon: 'bi bi-check-circle' },
        { label: 'Черновики', value: this.objectStats.drafts, icon: 'bi bi-file-earmark' }
      ];
    }
  },
  async created() {
    try {
      await this.fetchFloors();
      await this.fetchObjects();
    } catch (error) {
      console.error('Ошибка загрузки основных данных:', error);
    }

    // Статистику грузим отдельно, чтобы её ошибка не влияла на остальное
    try {
      await this.fetchStats();
    } catch (error) {
      // Уже обработано в store, здесь просто игнорируем
    }
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloors']),
    ...mapActions(useObjectStore, ['fetchObjects', 'fetchStats'])
  }
};
</script>