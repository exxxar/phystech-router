<template>
  <div class="card border-0 shadow-sm">
    <div class="card-body p-2">
      <h6 class="text-muted mb-2">Инструменты</h6>

      <div class="btn-group-vertical w-100 mb-3">
        <button
            class="btn"
            :class="activeTool === 'select' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="setTool('select')"
            title="Выбор элемента"
        >
          <i class="bi bi-cursor"></i> Выбор
        </button>
        <button
            class="btn"
            :class="activeTool === 'addNode' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="setTool('addNode')"
            title="Добавить узел графа"
        >
          <i class="bi bi-plus-circle"></i> Узел
        </button>
        <button
            class="btn"
            :class="activeTool === 'addEdge' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="setTool('addEdge')"
            title="Создать связь между узлами"
        >
          <i class="bi bi-bezier2"></i> Связь
        </button>
      </div>

      <hr>

      <h6 class="text-muted mb-2">Масштаб</h6>
      <div class="d-flex align-items-center gap-2 mb-2">
        <button class="btn btn-sm btn-outline-secondary" @click="zoomOut">
          <i class="bi bi-dash"></i>
        </button>
        <input
            type="range"
            class="form-range"
            min="0.5"
            max="3"
            step="0.1"
            :value="zoom"
            @input="handleZoomChange"
        >
        <button class="btn btn-sm btn-outline-secondary" @click="zoomIn">
          <i class="bi bi-plus"></i>
        </button>
      </div>
      <div class="text-center text-muted small">{{ Math.round(zoom * 100) }}%</div>

      <hr>

      <div class="form-check form-switch mb-2">
        <input class="form-check-input" type="checkbox" id="showIds" v-model="showIds">
        <label class="form-check-label small" for="showIds">Показать ID</label>
      </div>

      <div class="form-check form-switch">
        <input class="form-check-input" type="checkbox" id="showRooms" v-model="showRooms">
        <label class="form-check-label small" for="showRooms">Номера помещений</label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MapToolbar',
  props: {
    activeTool: { type: String, default: 'select' },
    zoom: { type: Number, default: 1 }
  },
  emits: ['tool-change', 'zoom-change'],
  data() {
    return {
      showIds: false,
      showRooms: true
    };
  },
  watch: {
    showIds(val) { this.$emit('option-change', { showIds: val }); },
    showRooms(val) { this.$emit('option-change', { showRooms: val }); }
  },
  methods: {
    setTool(tool) {
      this.$emit('tool-change', tool);
    },
    zoomIn() {
      this.$emit('zoom-change', Math.min(3, this.zoom + 0.2));
    },
    zoomOut() {
      this.$emit('zoom-change', Math.max(0.5, this.zoom - 0.2));
    },
    handleZoomChange(event) {
      this.$emit('zoom-change', parseFloat(event.target.value));
    }
  }
};
</script>