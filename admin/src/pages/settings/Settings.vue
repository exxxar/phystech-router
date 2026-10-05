<template>
  <div>
    <h1 class="mb-4">Настройки системы</h1>

    <!-- Табы -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'general' }" href="#" @click.prevent="activeTab = 'general'">
          <i class="bi bi-gear me-1"></i>Основные
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'navigation' }" href="#" @click.prevent="activeTab = 'navigation'">
          <i class="bi bi-signpost me-1"></i>Навигация
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'map' }" href="#" @click.prevent="activeTab = 'map'">
          <i class="bi bi-map me-1"></i>Карта
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'api' }" href="#" @click.prevent="activeTab = 'api'">
          <i class="bi bi-code-slash me-1"></i>API
        </a>
      </li>
    </ul>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <!-- Основные -->
      <div v-if="activeTab === 'general'" class="card border-0 shadow-sm">
        <div class="card-body">
          <form @submit.prevent="saveSettings('general')">
            <div class="mb-3">
              <label class="form-label">Название системы</label>
              <input type="text" class="form-control" v-model="general.title">
            </div>
            <div class="mb-3">
              <label class="form-label">Описание</label>
              <textarea class="form-control" rows="3" v-model="general.description"></textarea>
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Контактный email</label>
                <input type="email" class="form-control" v-model="general.contactEmail">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Контактный телефон</label>
                <input type="text" class="form-control" v-model="general.contactPhone">
              </div>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Сохранить
            </button>
          </form>
        </div>
      </div>

      <!-- Навигация -->
      <div v-if="activeTab === 'navigation'" class="card border-0 shadow-sm">
        <div class="card-body">
          <form @submit.prevent="saveSettings('navigation')">
            <div class="mb-3">
              <label class="form-label">Алгоритм по умолчанию</label>
              <select class="form-select" v-model="navigation.defaultAlgorithm">
                <option value="dijkstra">Дейкстра</option>
                <option value="astar">A*</option>
                <option value="bellman-ford">Беллман-Форд</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Максимальная длина маршрута (м)</label>
              <input type="number" class="form-control" v-model.number="navigation.maxRouteLength">
            </div>
            <div class="form-check form-switch mb-2">
              <input class="form-check-input" type="checkbox" v-model="navigation.defaultAccessible">
              <label class="form-check-label">По умолчанию учитывать доступность для МГН</label>
            </div>
            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" v-model="navigation.avoidStairsByDefault">
              <label class="form-check-label">По умолчанию избегать лестниц</label>
            </div>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Сохранить
            </button>
          </form>
        </div>
      </div>

      <!-- Карта -->
      <div v-if="activeTab === 'map'" class="card border-0 shadow-sm">
        <div class="card-body">
          <form @submit.prevent="saveSettings('map')">
            <div class="row">
              <div class="col-md-4 mb-3">
                <label class="form-label">Масштаб по умолчанию</label>
                <input type="number" step="0.1" class="form-control" v-model.number="map.defaultZoom">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Минимальный масштаб</label>
                <input type="number" step="0.1" class="form-control" v-model.number="map.minZoom">
              </div>
              <div class="col-md-4 mb-3">
                <label class="form-label">Максимальный масштаб</label>
                <input type="number" step="0.1" class="form-control" v-model.number="map.maxZoom">
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Цвет маршрута</label>
                <input type="color" class="form-control form-control-color" v-model="map.routeColor">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Толщина линии маршрута</label>
                <input type="number" class="form-control" v-model.number="map.routeWidth">
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Цвет узлов графа</label>
              <input type="color" class="form-control form-control-color" v-model="map.nodeColor">
            </div>

            <div class="form-check form-switch mb-3">
              <input class="form-check-input" type="checkbox" v-model="map.showRoomNumbers">
              <label class="form-check-label">Показывать номера помещений на карте</label>
            </div>

            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Сохранить
            </button>
          </form>
        </div>
      </div>

      <!-- API (только информация) -->
      <div v-if="activeTab === 'api'" class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            Этот раздел содержит только техническую информацию о API. Секретные ключи здесь не отображаются.
          </div>

          <div v-if="apiInfo">
            <div class="row g-3">
              <div class="col-md-6">
                <div class="border rounded p-3">
                  <h6 class="text-muted">Base URL</h6>
                  <code>{{ apiInfo.baseUrl || '—' }}</code>
                </div>
              </div>
              <div class="col-md-6">
                <div class="border rounded p-3">
                  <h6 class="text-muted">Версия API</h6>
                  <code>{{ apiInfo.version || '—' }}</code>
                </div>
              </div>
              <div class="col-md-6">
                <div class="border rounded p-3">
                  <h6 class="text-muted">Статус</h6>
                  <span class="badge" :class="apiInfo.status === 'ok' ? 'bg-success' : 'bg-danger'">
                    {{ apiInfo.status || '—' }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="border rounded p-3">
                  <h6 class="text-muted">База данных</h6>
                  <span class="badge" :class="apiInfo.database === 'ok' ? 'bg-success' : 'bg-danger'">
                    {{ apiInfo.database || '—' }}
                  </span>
                </div>
              </div>
              <div class="col-md-6">
                <div class="border rounded p-3">
                  <h6 class="text-muted">Граф</h6>
                  <span class="badge" :class="apiInfo.graph === 'ok' ? 'bg-success' : 'bg-danger'">
                    {{ apiInfo.graph || '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-4 text-muted">
            Информация API недоступна
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useSettingsStore } from '@/stores/settingsStore';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'SettingsPage',
  setup() {
    return { ...useNotification() };
  },
  data() {
    return {
      activeTab: 'general',
      saving: false
    };
  },
  computed: {
    ...mapState(useSettingsStore, ['general', 'navigation', 'map', 'apiInfo', 'loading'])
  },
  async created() {
    try {
      await Promise.all([
        this.fetchSettings(),
        this.fetchApiInfo()
      ]);
    } catch (e) {
      this.error('Ошибка загрузки настроек');
    }
  },
  methods: {
    ...mapActions(useSettingsStore, ['fetchSettings', 'updateSettings', 'fetchApiInfo']),
    async saveSettings(section) {
      this.saving = true;
      try {
        await this.updateSettings({ [section]: this[section] });
        this.success('Настройки сохранены');
      } catch (e) {
        this.error('Ошибка сохранения настроек');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>