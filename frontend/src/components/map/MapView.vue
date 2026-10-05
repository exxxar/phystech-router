<template>
  <div
      class="map-outer"
      ref="containerRef"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
  >
    <!-- Масштабируемая обёртка -->
    <div class="map-inner" :style="transformStyle">
      <svg
          :viewBox="`0 0 ${width} ${height}`"
          class="map-svg"
          preserveAspectRatio="xMidYMid meet"
      >
        <!-- Фоновое изображение этажа -->
        <image
            v-if="floorPlanUrl"
            :href="floorPlanUrl"
            x="0" y="0"
            :width="width"
            :height="height"
            preserveAspectRatio="xMidYMid meet"
        />

        <!-- Заглушка, если плана нет -->
        <g v-else>
          <rect x="0" y="0" :width="width" :height="height" fill="#F5F7FA" />
          <rect x="80" y="150" width="840" height="60" fill="#E5E7EB" stroke="#D1D5DB" rx="4" />
          <text x="500" y="185" text-anchor="middle" fill="#6B7280" font-size="14">Коридор</text>
        </g>

        <!-- Маршрут (линии между узлами) -->
        <g v-if="routeNodes.length > 1">
          <polyline
              :points="routePoints"
              fill="none"
              stroke="#172B4D"
              stroke-width="5"
              stroke-linecap="round"
              stroke-linejoin="round"
              opacity="0.8"
          />
          <polyline
              :points="routePoints"
              fill="none"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-dasharray="8 8"
              class="route-animation"
          />
        </g>

        <!-- Помещения -->
        <g
            v-for="node in visibleNodes.filter(n => n.type === 'room')"
            :key="node.id"
            class="marker-group"
            @click.stop="handleMarkerClick(node.id)"
        >
          <circle
              :cx="node.x" :cy="node.y" r="22"
              :fill="selectedNode === node.id ? '#172B4D' : 'rgba(23, 43, 77, 0.85)'"
              :stroke="selectedNode === node.id ? '#F59E0B' : 'white'"
              stroke-width="2.5"
              class="room-marker"
          />
          <text
              :x="node.x" :y="node.y + 4"
              text-anchor="middle"
              fill="white"
              font-size="11"
              font-weight="600"
              style="pointer-events: none;"
          >
            {{ getObjectLabel(node) }}
          </text>
        </g>

        <!-- Лестницы -->
        <g
            v-for="node in visibleNodes.filter(n => n.type === 'stairs')"
            :key="node.id"
            class="marker-group"
            @click.stop="handleMarkerClick(node.id)"
        >
          <circle
              :cx="node.x" :cy="node.y" r="20"
              fill="#334E68" stroke="white" stroke-width="2.5"
              class="marker"
          />
          <text :x="node.x" :y="node.y + 5" text-anchor="middle" fill="white" font-size="16" style="pointer-events: none;">⇅</text>
        </g>

        <!-- Входы -->
        <g
            v-for="node in visibleNodes.filter(n => n.type === 'entrance')"
            :key="node.id"
            class="marker-group"
            @click.stop="handleMarkerClick(node.id)"
        >
          <circle
              :cx="node.x" :cy="node.y" r="20"
              fill="#027A48" stroke="white" stroke-width="2.5"
              class="marker"
          />
          <text :x="node.x" :y="node.y + 6" text-anchor="middle" fill="white" font-size="18" style="pointer-events: none;">→</text>
        </g>

        <!-- Текущая позиция -->
        <g v-if="position">
          <circle :cx="position.x" :cy="position.y" r="18" fill="#172B4D" opacity="0.2">
            <animate attributeName="r" values="18;28;18" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle :cx="position.x" :cy="position.y" r="10" fill="#172B4D" stroke="white" stroke-width="3" />
        </g>
      </svg>
    </div>

    <!-- Кнопки управления зумом -->
    <div class="zoom-controls">
      <button class="zoom-btn" @click.stop="zoomIn" aria-label="Приблизить">
        <i class="bi bi-plus-lg"></i>
      </button>
      <button class="zoom-btn" @click.stop="zoomOut" aria-label="Отдалить">
        <i class="bi bi-dash-lg"></i>
      </button>
      <button class="zoom-btn" @click.stop="resetView" aria-label="Сбросить вид">
        <i class="bi bi-arrows-fullscreen"></i>
      </button>
    </div>

    <!-- Индикатор масштаба -->
    <div class="zoom-level" v-if="scale !== 1">
      {{ Math.round(scale * 100) }}%
    </div>

    <!-- Подсказка -->
    <div class="map-hint" v-if="showHint">
      <i class="bi bi-hand-index-thumb me-1"></i>
      Перетащите для перемещения
    </div>

    <!-- Индикатор загрузки изображения -->
    <div v-if="floorPlanUrl && !imageLoaded" class="position-absolute top-50 start-50 translate-middle">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, onMounted, onUnmounted } from 'vue';
import type { GraphNode } from '@/types';

export default defineComponent({
  name: 'DepartmentMapView',
  props: {
    visibleNodes: { type: Array as () => GraphNode[], required: true },
    selectedNode: String,
    position: Object as () => { x: number; y: number } | null,
    routeNodes: { type: Array as () => string[], default: () => [] },
    width: { type: Number, default: 1000 },
    height: { type: Number, default: 600 },
    objects: { type: Array, default: () => [] },
    floorPlanUrl: { type: String, default: '' },
  },
  emits: ['selectNode'],
  setup(props, { emit }) {
    const containerRef = ref<HTMLElement | null>(null);
    const imageLoaded = ref(false);
    const showHint = ref(true);

    // === Zoom & Pan state ===
    const scale = ref(1);
    const rotate = ref(90);
    const translateX = ref(0);
    const translateY = ref(0);
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 5;

    // === Pointer tracking ===
    const pointers = new Map<number, { x: number; y: number }>();
    let lastPinchDistance = 0;
    let isDragging = false;
    let hasDragged = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let translateStartX = 0;
    let translateStartY = 0;

    // === Computed ===
    const transformStyle = computed(() => ({
      transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value}) `,
      transformOrigin: '0 0',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    }));

    const routePoints = computed(() => {
      return props.routeNodes
          .map((id) => props.visibleNodes.find((n) => n.id === id))
          .filter((n): n is GraphNode => !!n)
          .map((n) => `${n.x},${n.y}`)
          .join(' ');
    });

    const getObjectLabel = (node: GraphNode) => {
      const obj = (props.objects as any[]).find((o) => o.id === node.objectId);
      return obj?.roomNumber || (obj?.name || node.id).slice(0, 6);
    };

    // === Zoom functions ===
    function zoomTo(newScale: number, centerX: number, centerY: number) {
      const clampedScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScale));
      const ratio = clampedScale / scale.value;
      translateX.value = centerX - (centerX - translateX.value) * ratio;
      translateY.value = centerY - (centerY - translateY.value) * ratio;
      scale.value = clampedScale;
    }

    function zoomIn() {
      const rect = containerRef.value?.getBoundingClientRect();
      if (!rect) return;
      zoomTo(scale.value * 1.3, rect.width / 2, rect.height / 2);
    }

    function zoomOut() {
      const rect = containerRef.value?.getBoundingClientRect();
      if (!rect) return;
      zoomTo(scale.value / 1.3, rect.width / 2, rect.height / 2);
    }

    function resetView() {
      scale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
    }

    // === Pointer handlers (pan + pinch-zoom) ===
    function onPointerDown(e: PointerEvent) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        isDragging = true;
        hasDragged = false;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        translateStartX = translateX.value;
        translateStartY = translateY.value;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }

      if (pointers.size === 2) {
        isDragging = false;
        const pts = Array.from(pointers.values());
        lastPinchDistance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      }

      // Скрываем подсказку при первом взаимодействии
      if (showHint.value) showHint.value = false;
    }

    function onPointerMove(e: PointerEvent) {
      if (!pointers.has(e.pointerId)) return;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      // Pan (один палец)
      if (pointers.size === 1 && isDragging) {
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          hasDragged = true;
        }
        translateX.value = translateStartX + dx;
        translateY.value = translateStartY + dy;
      }

      // Pinch-zoom (два пальца)
      if (pointers.size === 2) {
        const pts = Array.from(pointers.values());
        const distance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const centerX = (pts[0].x + pts[1].x) / 2;
        const centerY = (pts[0].y + pts[1].y) / 2;

        if (lastPinchDistance > 0) {
          const rect = containerRef.value?.getBoundingClientRect();
          if (rect) {
            const cx = centerX - rect.left;
            const cy = centerY - rect.top;
            const newScale = scale.value * (distance / lastPinchDistance);
            zoomTo(newScale, cx, cy);
          }
        }
        lastPinchDistance = distance;
      }
    }

    function onPointerUp(e: PointerEvent) {
      pointers.delete(e.pointerId);
      if (pointers.size === 0) {
        isDragging = false;
      }
      if (pointers.size < 2) {
        lastPinchDistance = 0;
      }
    }

    // === Wheel zoom (десктоп) ===
    function onWheel(e: WheelEvent) {
      e.preventDefault();
      const rect = containerRef.value?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomTo(scale.value * factor, cx, cy);
      if (showHint.value) showHint.value = false;
    }

    // === Marker click (с защитой от drag) ===
    function handleMarkerClick(nodeId: string) {
      if (hasDragged) return;
      emit('selectNode', nodeId);
    }

    // === Lifecycle ===
    onMounted(() => {
      // Wheel event нужно регистрировать вручную с passive: false
      containerRef.value?.addEventListener('wheel', onWheel, { passive: false });

      // Скрываем подсказку через 5 секунд
      setTimeout(() => { showHint.value = false; }, 5000);
    });

    onUnmounted(() => {
      containerRef.value?.removeEventListener('wheel', onWheel);
    });

    // === Image loading ===
    watch(() => props.floorPlanUrl, () => {
      imageLoaded.value = false;
      resetView();
      if (props.floorPlanUrl) {
        const img = new Image();
        img.onload = () => { imageLoaded.value = true; };
        img.onerror = () => { imageLoaded.value = true; };
        img.src = props.floorPlanUrl;
      } else {
        imageLoaded.value = true;
      }
    }, { immediate: true });

    return {
      containerRef,
      imageLoaded,
      showHint,
      scale,
      transformStyle,
      routePoints,
      getObjectLabel,
      zoomIn,
      zoomOut,
      resetView,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      handleMarkerClick,
    };
  },
});
</script>

<style scoped>
.map-outer {
  position: relative;
  aspect-ratio: 5 / 3;
  background: #F5F7FA;
  border-radius: 12px;
  overflow: hidden;
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  cursor: grab;
}

.map-outer:active {
  cursor: grabbing;
}

.map-inner {
  width: 100%;
  height: 100%;
  will-change: transform;
}

.map-svg {
  width: 100%;
  height: 100%;
  display: block;
  background: white;
}

.room-marker {
  cursor: pointer;
  transition: fill 0.15s;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.room-marker:hover {
  fill: #172B4D;
}

.marker {
  cursor: pointer;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.marker-group {
  cursor: pointer;
}

.route-animation {
  animation: dash 1.5s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -32;
  }
}

/* === Кнопки зума === */
.zoom-controls {
  position: absolute;
  bottom: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 10;
}

.zoom-btn {
  width: 44px;
  height: 44px;
  border: none;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(23, 43, 77, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #172B4D;
  cursor: pointer;
  transition: all 0.15s;
}

.zoom-btn:hover {
  background: #172B4D;
  color: white;
}

.zoom-btn:active {
  transform: scale(0.92);
}

/* === Индикатор масштаба === */
.zoom-level {
  position: absolute;
  bottom: 16px;
  left: 16px;
  background: rgba(23, 43, 77, 0.8);
  color: white;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  z-index: 10;
  pointer-events: none;
}

/* === Подсказка === */
.map-hint {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(23, 43, 77, 0.85);
  color: white;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
  animation: hintFade 5s ease-in-out forwards;
  white-space: nowrap;
}

@keyframes hintFade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; }
}
</style>