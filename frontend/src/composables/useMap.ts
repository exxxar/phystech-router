import { ref, computed } from 'vue';
import { mapService } from '@/services/mapService';
import type { Floor, Graph, GraphNode } from '@/types';

export function useMap() {
    const floors = ref<Floor[]>([]);
    const currentFloor = ref<number>(4);
    const graph = ref<Graph | null>(null);
    const selectedNode = ref<string | null>(null);
    const loading = ref(false);

    const activeFloor = computed(() => floors.value.find((f) => f.number === currentFloor.value));
    const visibleNodes = computed<GraphNode[]>(() => {
        if (!graph.value) return [];
        return graph.value.nodes.filter((n) => n.floorId === currentFloor.value);
    });

    async function load() {
        loading.value = true;
        try {
            floors.value = await mapService.getFloors();
            graph.value = await mapService.getGraph();
        } finally { loading.value = false; }
    }

    function setFloor(n: number) { currentFloor.value = n; }
    function selectNode(id: string | null) { selectedNode.value = id; }

    return { floors, currentFloor, graph, selectedNode, loading, activeFloor, visibleNodes, load, setFloor, selectNode };
}