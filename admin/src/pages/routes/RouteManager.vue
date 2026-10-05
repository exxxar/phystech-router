<template>
  <div>
    <h1 class="mb-4">Проверка маршрутов</h1>

    <div class="row">
      <!-- Панель управления -->
      <div class="col-md-4">
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-header bg-white">
            <h5 class="mb-0">Параметры маршрута</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="buildRoute">
              <div class="mb-3">
                <label class="form-label">Этаж</label>
                <select class="form-select" v-model="form.floorId" @change="loadNodes" required>
                  <option value="">Выберите этаж</option>
                  <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                    {{ floor.name }} ({{ floor.number }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Начальная точка</label>
                <select class="form-select" v-model="form.fromNodeId" required :disabled="!form.floorId">
                  <option value="">Выберите узел</option>
                  <option v-for="node in availableNodes" :key="node.id" :value="node.id">
                    Узел #{{ node.id }} ({{ node.type }})
                  </option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label">Конечная точка</label>
                <select class="form-select" v-model="form.toNodeId" required :disabled="!form.floorId">
                  <option value="">Выберите узел</option>
                  <option v-for="node in availableNodes" :key="node.id" :value="node.id">
                    Узел #{{ node.id }} ({{ node.type }})
                  </option>
                </select>
              </div>

              <div class="mb-3 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="accessible" v-model="form.accessible">
                <label class="form-check-label" for="accessible">Только доступные пути (для МГН)</label>
              </div>

              <div class="mb-3 form-check form-switch">
                <input class="form-check-input" type="checkbox" id="avoidStairs" v-model="form.avoidStairs">
                <label class="form-check-label" for="avoidStairs">Избегать лестниц</label>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="loading || !form.floorId || !form.fromNodeId || !form.toNodeId">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Построить маршрут
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="compareAlgorithms" :disabled="loading || !form.floorId || !form.fromNodeId || !form.toNodeId">
                  Сравнить алгоритмы
                </button>
                <button type="button" class="btn btn-outline-danger" @click="clearRoute" v-if="currentRoute">
                  Очистить
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Результаты -->
        <div v-if="currentRoute" class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Результат</h5>
          </div>
          <div class="card-body">
            <div class="row g-3 mb-3">
              <div class="col-6">
                <div class="border rounded p-2 text-center">
                  <div class="fs-4 fw-bold text-primary">{{ currentRoute.length?.toFixed(2) || 0 }}</div>
                  <small class="text-muted">Длина (м)</small>
                </div>
              </div>
              <div class="col-6">
                <div class="border rounded p-2 text-center">
                  <div class="fs-4 fw-bold text-success">{{ currentRoute.transitions || 0 }}</div>
                  <small class="text-muted">Переходов</small>
                </div>
              </div>
              <div class="col-6">
                <div class="border rounded p-2 text-center">
                  <div class="fs-4 fw-bold text-info">{{ currentRoute.floors || 1 }}</div>
                  <small class="text-muted">Этажей</small>
                </div>
              </div>
              <div class="col-6">
                <div class="border rounded p-2 text-center">
                  <div class="fs-4 fw-bold text-warning">{{ currentRoute.duration || 0 }}</div>
                  <small class="text-muted">Время (мин)</small>
                </div>
              </div>
            </div>

            <div v-if="currentRoute.algorithm" class="alert alert-info py-2 mb-3">
              <small>Алгоритм: <strong>{{ currentRoute.algorithm }}</strong></small>
            </div>

            <h6>Путь:</h6>
            <ol class="list-group list-group-numbered">
              <li v-for="(nodeId, index) in currentRoute.path" :key="index" class="list-group-item py-2">
                <div class="d-flex justify-content-between align-items-center">
                  <span>Узел #{{ nodeId }}</span>
                  <i v-if="index < currentRoute.path.length - 1" class="bi bi-arrow-down text-muted"></i>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Сравнение алгоритмов -->
        <div v-if="comparison" class="card border-0 shadow-sm mt-3">
          <div class="card-header bg-white">
            <h5 class="mb-0">Сравнение алгоритмов</h5>
          </div>
          <div class="card-body">
            <table class="table table-sm">
              <thead>
              <tr>
                <th>Алгоритм</th>
                <th>Длина</th>
                <th>Время</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="alg in comparison.algorithms" :key="alg.name">
                <td>{{ alg.name }}</td>
                <td>{{ alg.length?.toFixed(2) }} м</td>
                <td>{{ alg.duration }} мин</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Визуализация -->
      <div class="col-md-8">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Визуализация маршрута</h5>
          </div>
          <div class="card-body p-0">
            <div v-if="!currentRoute" class="text-center py-5 text-muted">
              <i class="bi bi-map fs-1"></i>
              <p class="mt-2">Выберите параметры и постройте маршрут</p>
            </div>
            <div v-else class="position-relative" style="height: 600px; background: #f8f9fa;">
              <svg class="w-100 h-100" viewBox="0 0 1000 800">
                <!-- Базовый SVG этажа -->
                <g v-if="floorSvg" v-html="floorSvg"></g>

                <!-- Путь маршрута -->
                <g v-if="currentRoute?.path">
                  <polyline
                      :points="routePoints"
                      fill="none"
                      stroke="#28a745"
                      stroke-width="4"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                  />
                  <!-- Точки маршрута -->
                  <circle
                      v-for="(point, index) in routePathPoints"
                      :key="index"
                      :cx="point.x"
                      :cy="point.y"
                      r="6"
                      :fill="index === 0 ? '#28a745' : index === routePathPoints.length - 1 ? '#dc3545' : '#0d6efd'"
                      stroke="#fff"
                      stroke-width="2"
                  />
                </g>
              </svg>

              <!-- Легенда -->
              <div class="position-absolute bottom-0 start-0 m-3 bg-white p-2 rounded shadow-sm">
                <div class="d-flex align-items-center mb-1">
                  <div class="rounded-circle bg-success me-2" style="width: 12px; height: 12px;"></div>
                  <small>Начало</small>
                </div>
                <div class="d-flex align-items-center mb-1">
                  <div class="rounded-circle bg-primary me-2" style="width: 12px; height: 12px;"></div>
                  <small>Промежуточные</small>
                </div>
                <div class="d-flex align-items-center">
                  <div class="rounded-circle bg-danger me-2" style="width: 12px; height: 12px;"></div>
                  <small>Конец</small>
                </div>
              </div>
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
import { useRouteStore } from '@/stores/routeStore';
import { useGraphStore } from '@/stores/graphStore';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'RouteManagerPage',
  setup() {
    return { ...useNotification() };
  },
  data() {
    return {
      form: {
        floorId: '',
        fromNodeId: '',
        toNodeId: '',
        accessible: false,
        avoidStairs: false
      },
      floorSvg: ''
    };
  },
  computed: {
    ...mapState(useFloorStore, ['items']),
    ...mapState(useRouteStore, ['currentRoute', 'comparison', 'availableNodes', 'loading']),
    ...mapState(useGraphStore, ['nodes']),
    floors() { return this.items; },
    routePathPoints() {
      if (!this.currentRoute?.path) return [];
      return this.currentRoute.path.map(nodeId => {
        const node = this.nodes.find(n => n.id === nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
      });
    },
    routePoints() {
      return this.routePathPoints.map(p => `${p.x},${p.y}`).join(' ');
    }
  },
  async created() {
    await this.fetchFloors({ limit: 100 });
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloors', 'fetchFloor']),
    ...mapActions(useRouteStore, ['buildRoute', 'compareAlgorithms', 'fetchAvailableNodes', 'clearRoute']),
    ...mapActions(useGraphStore, ['fetchFloorGraph']),
    async loadNodes() {
      if (!this.form.floorId) return;

      try {
        await Promise.all([
          this.fetchAvailableNodes({ floorId: this.form.floorId }),
          this.fetchFloorGraph(this.form.floorId),
          this.fetchFloor(this.form.floorId)
        ]);

        this.floorSvg = this.current?.svgContent || '';
        this.form.fromNodeId = '';
        this.form.toNodeId = '';
      } catch (e) {
        this.error('Ошибка загрузки узлов');
      }
    },
    async buildRoute() {
      try {
        await this.buildRoute({
          fromNodeId: this.form.fromNodeId,
          toNodeId: this.form.toNodeId,
          floorId: this.form.floorId,
          accessible: this.form.accessible,
          avoidStairs: this.form.avoidStairs
        });
        this.success('Маршрут построен');
      } catch (e) {
        this.error(e.response?.data?.message || 'Не удалось построить маршрут');
      }
    },
    async compareAlgorithms() {
      try {
        await this.compareAlgorithms({
          fromNodeId: this.form.fromNodeId,
          toNodeId: this.form.toNodeId,
          floorId: this.form.floorId
        });
        this.success('Сравнение выполнено');
      } catch (e) {
        this.error('Ошибка сравнения алгоритмов');
      }
    },
    clearRoute() {
      this.clearRoute();
      this.comparison = null;
    }
  }
};
</script>