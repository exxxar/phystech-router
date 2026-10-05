<template>
  <div class="map-editor-container position-relative" style="height: 600px; overflow: hidden; background: #f8f9fa;">
    <svg
        ref="svgCanvas"
        class="w-100 h-100"
        :viewBox="viewBox"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @wheel="handleWheel"
        style="cursor: cursorStyle;"
    >
      <g :transform="transform">
        <!-- Слой 1: Базовый SVG-план -->
        <g v-if="svgContent" v-html="svgContent"></g>

        <!-- Слой 2: Помещения (опционально, если есть данные) -->
        <g v-if="showRooms">
          <rect
              v-for="room in rooms"
              :key="room.id"
              :x="room.coordinates?.x || 0"
              :y="room.coordinates?.y || 0"
              :width="room.coordinates?.width || 50"
              :height="room.coordinates?.height || 50"
              fill="rgba(13, 110, 253, 0.1)"
              stroke="#0d6efd"
              stroke-width="2"
          >
            <title>{{ room.number }} - {{ room.name }}</title>
          </rect>
          <text
              v-for="room in rooms"
              :key="'text-' + room.id"
              :x="(room.coordinates?.x || 0) + 25"
              :y="(room.coordinates?.y || 0) + 30"
              text-anchor="middle"
              font-size="12"
              fill="#0d6efd"
          >
            {{ room.number }}
          </text>
        </g>

        <!-- Слой 3: Рёбра графа -->
        <g>
          <line
              v-for="edge in edges"
              :key="edge.id"
              :x1="getNodeX(edge.fromNodeId)"
              :y1="getNodeY(edge.fromNodeId)"
              :x2="getNodeX(edge.toNodeId)"
              :y2="getNodeY(edge.toNodeId)"
              :stroke="edgeColor(edge)"
              :stroke-width="edgeWidth(edge)"
              stroke-dasharray="5,5"
          >
            <title>{{ edge.type }} (вес: {{ edge.weight }})</title>
          </line>
        </g>

        <!-- Слой 4: Узлы графа -->
        <g>
          <circle
              v-for="node in nodes"
              :key="node.id"
              :cx="node.x"
              :cy="node.y"
              r="8"
              :fill="nodeColor(node)"
              stroke="#fff"
              stroke-width="2"
              style="cursor: pointer;"
              @click="handleNodeClick(node)"
          >
            <title>Узел {{ node.id }} ({{ node.type }})</title>
          </circle>
          <text
              v-if="showIds"
              v-for="node in nodes"
              :key="'label-' + node.id"
              :x="node.x"
              :y="node.y - 12"
              text-anchor="middle"
              font-size="10"
              fill="#333"
          >
            {{ node.id }}
          </text>
        </g>

        <!-- Слой 5: Интерактивный (для создания связи) -->
        <line
            v-if="activeTool === 'addEdge' && edgeStartNode && mousePosition"
            :x1="edgeStartNode.x"
            :y1="edgeStartNode.y"
            :x2="mousePosition.x"
            :y2="mousePosition.y"
            stroke="#28a745"
            stroke-width="2"
            stroke-dasharray="5,5"
        />
      </g>
    </svg>

    <!-- Индикатор загрузки -->
    <div v-if="loading" class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useGraphStore } from '@/stores/graphStore';
import { useNotification } from '@/composables/useNotification';

export default {
  name: 'MapEditor',
  props: {
    floorId: { type: [String, Number], required: true },
    svgContent: { type: String, default: '' },
    rooms: { type: Array, default: () => [] }
  },
  emits: ['node-selected', 'node-created', 'edge-created'],
  setup() {
    return { ...useNotification() };
  },
  data() {
    return {
      viewBox: '0 0 1000 800',
      zoom: 1,
      panX: 0,
      panY: 0,
      isPanning: false,
      lastMouseX: 0,
      lastMouseY: 0,
      activeTool: 'select',
      edgeStartNode: null,
      mousePosition: null,
      showIds: false,
      showRooms: true,
      loading: false
    };
  },
  computed: {
    ...mapState(useGraphStore, ['nodes', 'edges']),
    transform() {
      return `translate(${this.panX}, ${this.panY}) scale(${this.zoom})`;
    },
    cursorStyle() {
      if (this.activeTool === 'addNode') return 'crosshair';
      if (this.activeTool === 'addEdge') return 'pointer';
      if (this.isPanning) return 'grabbing';
      return 'grab';
    }
  },
  async created() {
    await this.loadGraph();
  },
  methods: {
    ...mapActions(useGraphStore, ['fetchFloorGraph', 'createNode', 'createEdge']),
    async loadGraph() {
      this.loading = true;
      try {
        await this.fetchFloorGraph(this.floorId);
      } catch (e) {
        this.error('Ошибка загрузки графа');
      } finally {
        this.loading = false;
      }
    },
    getNodeX(nodeId) {
      const node = this.nodes.find(n => n.id === nodeId);
      return node ? node.x : 0;
    },
    getNodeY(nodeId) {
      const node = this.nodes.find(n => n.id === nodeId);
      return node ? node.y : 0;
    },
    nodeColor(node) {
      if (!node.accessible) return '#dc3545';
      if (node.type === 'stairs') return '#ffc107';
      if (node.type === 'entrance') return '#28a745';
      return '#0d6efd';
    },
    edgeColor(edge) {
      if (!edge.accessible) return '#dc3545';
      if (edge.type === 'interfloor') return '#ffc107';
      return '#6c757d';
    },
    edgeWidth(edge) {
      return edge.type === 'interfloor' ? 3 : 2;
    },
    handleMouseDown(event) {
      if (this.activeTool === 'select') {
        this.isPanning = true;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
      } else if (this.activeTool === 'addNode') {
        this.handleCreateNode(event);
      }
    },
    handleMouseMove(event) {
      if (this.isPanning) {
        const dx = event.clientX - this.lastMouseX;
        const dy = event.clientY - this.lastMouseY;
        this.panX += dx;
        this.panY += dy;
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
      }

      if (this.activeTool === 'addEdge' && this.edgeStartNode) {
        const svgPoint = this.getSVGPoint(event);
        this.mousePosition = { x: svgPoint.x, y: svgPoint.y };
      }
    },
    handleMouseUp() {
      this.isPanning = false;
    },
    handleWheel(event) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? -0.1 : 0.1;
      this.zoom = Math.max(0.5, Math.min(3, this.zoom + delta));
    },
    handleNodeClick(node) {
      if (this.activeTool === 'select') {
        this.$emit('node-selected', node);
      } else if (this.activeTool === 'addEdge') {
        if (!this.edgeStartNode) {
          this.edgeStartNode = node;
          this.info('Выберите второй узел для создания связи');
        } else {
          this.handleCreateEdge(node);
        }
      }
    },
    async handleCreateNode(event) {
      const svgPoint = this.getSVGPoint(event);
      try {
        const node = await this.createNode({
          floorId: this.floorId,
          x: svgPoint.x,
          y: svgPoint.y,
          type: 'corridor',
          accessible: true
        });
        this.success('Узел создан');
        this.$emit('node-created', node);
      } catch (e) {
        this.error('Ошибка создания узла');
      }
    },
    async handleCreateEdge(endNode) {
      try {
        const edge = await this.createEdge({
          fromNodeId: this.edgeStartNode.id,
          toNodeId: endNode.id,
          weight: 1,
          type: 'corridor-corridor',
          accessible: true
        });
        this.success('Связь создана');
        this.$emit('edge-created', edge);
        this.edgeStartNode = null;
        this.mousePosition = null;
      } catch (e) {
        this.error('Ошибка создания связи');
      }
    },
    getSVGPoint(event) {
      const svg = this.$refs.svgCanvas;
      const pt = svg.createSVGPoint();
      pt.x = event.clientX;
      pt.y = event.clientY;
      const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
      return {
        x: (svgP.x - this.panX) / this.zoom,
        y: (svgP.y - this.panY) / this.zoom
      };
    }
  }
};
</script>