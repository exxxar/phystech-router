import { defineStore } from 'pinia';
import { mapService } from '@/services/mapService';
import type { Floor, Graph, GraphNode } from '@/types';

export const useMapStore = defineStore('map', {
    state: () => ({
        floors: [] as Floor[],
        graph: null as Graph | null,
        currentFloor: 4,
        selectedNode: null as string | null,
        currentPosition: null as { x: number; y: number } | null,
        loading: false,
        error: null as string | null,
    }),
    getters: {
        activeFloor: (state) => state.floors.find((f) => f.number === state.currentFloor),
        visibleNodes: (state): GraphNode[] =>
            state.graph ? state.graph.nodes.filter((n) => n.floorId === state.currentFloor) : [],
    },
    actions: {
        async load() {
            this.loading = true;
            try {
                this.floors = await mapService.getFloors();
                this.graph = await mapService.getGraph();
            } catch (e: any) { this.error = e.message; }
            finally { this.loading = false; }
        },
        setFloor(n: number) { this.currentFloor = n; },
        selectNode(id: string | null) { this.selectedNode = id; },
        setPosition(p: { x: number; y: number } | null) { this.currentPosition = p; },
    },
});