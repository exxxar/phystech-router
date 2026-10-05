<template>
  <div>
    <h1 class="mb-4">Редактор графа навигации</h1>

    <!-- Статистика -->
    <div class="row g-4 mb-4">
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <h3>{{ nodes.length }}</h3>
            <p class="text-muted mb-0">Узлов</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <h3>{{ edges.length }}</h3>
            <p class="text-muted mb-0">Связей</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <h3 class="text-warning">{{ isolatedNodes.length }}</h3>
            <p class="text-muted mb-0">Изолированных</p>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <h3 class="text-info">{{ interfloorEdges.length }}</h3>
            <p class="text-muted mb-0">Межэтажных</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Выбор этажа -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <label class="form-label">Выберите этаж для редактирования графа</label>
            <select class="form-select" v-model="selectedFloorId" @change="loadFloorGraph">
              <option value="">— Выберите этаж —</option>
              <option v-for="floor in floors" :key="floor.id" :value="floor.id">
                {{ floor.name }} ({{ floor.number }})
              </option>
            </select>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-outline-primary" @click="validateGraph" :disabled="!selectedFloorId">
              <i class="bi bi-check-circle me-2"></i>Проверить граф
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Результаты проверки -->
    <div v-if="validation" class="alert" :class="validation.isValid ? 'alert-success' : 'alert-warning'">
      <h5>{{ validation.isValid ? 'Граф корректен' : 'Обнаружены проблемы' }}</h5>
      <ul class="mb-0">
        <li v-for="(issue, index) in validation.issues" :key="index">{{ issue }}</li>
      </ul>
    </div>

    <!-- Таблицы узлов и рёбер -->
    <div v-if="selectedFloorId" class="row">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Узлы графа</h5>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
              <tr>
                <th>ID</th>
                <th>Тип</th>
                <th>Координаты</th>
                <th>Доступность</th>
                <th>Действия</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="node in nodes" :key="node.id">
                <td>{{ node.id }}</td>
                <td>{{ node.type }}</td>
                <td>{{ node.x }}, {{ node.y }}</td>
                <td>
                  <i :class="node.accessible ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteNode(node.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card border-0 shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Связи (рёбра)</h5>
          </div>
          <div class="card-body p-0">
            <table class="table table-hover mb-0">
              <thead>
              <tr>
                <th>ID</th>
                <th>От → К</th>
                <th>Тип</th>
                <th>Вес</th>
                <th>Действия</th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="edge in edges" :key="edge.id">
                <td>{{ edge.id }}</td>
                <td>{{ edge.fromNodeId }} → {{ edge.toNodeId }}</td>
                <td>{{ edge.type }}</td>
                <td>{{ edge.weight }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" @click="deleteEdge(edge.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useFloorStore } from '@/stores/floorStore';
import { useGraphStore } from '@/stores/graphStore';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'GraphEditorPage',
  setup() {
    return { ...useNotification() };
  },
  data() {
    return {
      selectedFloorId: '',
      validation: null
    };
  },
  computed: {
    ...mapState(useFloorStore, ['items']),
    ...mapState(useGraphStore, ['nodes', 'edges', 'isolatedNodes', 'interfloorEdges']),
    floors() { return this.items; }
  },
  async created() {
    await this.fetchFloors({ limit: 100 });
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloors']),
    ...mapActions(useGraphStore, ['fetchFloorGraph', 'deleteNode', 'deleteEdge', 'validateGraph']),
    async loadFloorGraph() {
      if (!this.selectedFloorId) return;
      try {
        await this.fetchFloorGraph(this.selectedFloorId);
        this.validation = null;
      } catch (e) {
        this.error('Ошибка загрузки графа');
      }
    },
    async deleteNode(nodeId) {
      if (!confirm('Удалить узел? Все связанные рёбра будут удалены.')) return;
      try {
        await this.deleteNode(nodeId);
        this.success('Узел удалён');
      } catch (e) {
        this.error('Ошибка удаления');
      }
    },
    async deleteEdge(edgeId) {
      if (!confirm('Удалить связь?')) return;
      try {
        await this.deleteEdge(edgeId);
        this.success('Связь удалена');
      } catch (e) {
        this.error('Ошибка удаления');
      }
    },
    async validateGraph() {
      try {
        this.validation = await this.validateGraph(this.selectedFloorId);
        if (this.validation.isValid) {
          this.success('Граф корректен');
        } else {
          this.warning('Обнаружены проблемы в графе');
        }
      } catch (e) {
        this.error('Ошибка проверки графа');
      }
    }
  }
};
</script>