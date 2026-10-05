<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Карта этажа: {{ floor?.name || 'Загрузка...' }}</h1>
      <div class="btn-group">
        <button class="btn btn-success" @click="saveChanges" :disabled="!hasChanges">
          <i class="bi bi-check-circle me-2"></i>Сохранить
        </button>
        <router-link to="/floors" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-2"></i>Назад
        </router-link>
      </div>
    </div>

    <div class="row">
      <div class="col-md-2">
        <MapToolbar
            :activeTool="activeTool"
            :zoom="zoom"
            @tool-change="setTool"
            @zoom-change="setZoom"
            @option-change="handleOptionChange"
        />
      </div>
      <div class="col-md-10">
        <MapEditor
            :floorId="$route.params.id"
            :svgContent="floor?.svgContent || ''"
            :rooms="floor?.rooms || []"
            @node-selected="handleNodeSelected"
            @node-created="handleNodeCreated"
            @edge-created="handleEdgeCreated"
        />
      </div>
    </div>

    <!-- Панель информации о выбранном узле -->
    <div v-if="selectedNode" class="card mt-3">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0">Узел графа #{{ selectedNode.id }}</h5>
        <button class="btn btn-sm btn-outline-danger" @click="deleteSelectedNode">
          <i class="bi bi-trash"></i> Удалить
        </button>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <label class="form-label">Тип</label>
            <select class="form-select" v-model="selectedNode.type" @change="updateNodeField('type', selectedNode.type)">
              <option value="corridor">Коридор</option>
              <option value="stairs">Лестница</option>
              <option value="entrance">Вход/выход</option>
              <option value="room">Помещение</option>
            </select>
          </div>
          <div class="col-md-6">
            <div class="form-check form-switch mt-4">
              <input class="form-check-input" type="checkbox" v-model="selectedNode.accessible" @change="updateNodeField('accessible', selectedNode.accessible)">
              <label class="form-check-label">Доступно для МГН</label>
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
import { useGraphStore } from '@/stores/graphStore';
import { useNotification } from '@/composables/useNotification';
import MapToolbar from '@/components/maps/MapToolbar.vue';
import MapEditor from '@/components/maps/MapEditor.vue';

export default {
  name: 'FloorMapPage',
  components: { MapToolbar, MapEditor },
  setup() {
    return { ...useNotification() };
  },
  data() {
    return {
      activeTool: 'select',
      zoom: 1,
      selectedNode: null,
      hasChanges: false
    };
  },
  computed: {
    ...mapState(useFloorStore, ['current']),
    floor() { return this.current; }
  },
  async created() {
    try {
      await this.fetchFloor(this.$route.params.id);
    } catch (e) {
      this.error('Ошибка загрузки этажа');
      this.$router.push('/floors');
    }
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloor']),
    ...mapActions(useGraphStore, ['deleteNode', 'updateNode']),
    setTool(tool) { this.activeTool = tool; },
    setZoom(zoom) { this.zoom = zoom; },
    handleOptionChange(options) {
      // Передаём в MapEditor через ref или props
    },
    handleNodeSelected(node) {
      this.selectedNode = node;
    },
    handleNodeCreated(node) {
      this.hasChanges = true;
      this.success('Узел добавлен');
    },
    handleEdgeCreated(edge) {
      this.hasChanges = true;
      this.success('Связь добавлена');
    },
    async updateNodeField(field, value) {
      try {
        await this.updateNode(this.selectedNode.id, { [field]: value });
        this.hasChanges = true;
      } catch (e) {
        this.error('Ошибка обновления узла');
      }
    },
    async deleteSelectedNode() {
      if (!confirm('Удалить узел? Все связанные рёбра будут удалены.')) return;
      try {
        await this.deleteNode(this.selectedNode.id);
        this.selectedNode = null;
        this.hasChanges = true;
        this.success('Узел удалён');
      } catch (e) {
        this.error('Ошибка удаления узла');
      }
    },
    saveChanges() {
      this.success('Все изменения сохранены');
      this.hasChanges = false;
    }
  }
};
</script>