import { defineStore } from 'pinia';
import { graphService } from '@/services/graph.service';

export const useGraphStore = defineStore('graph', {
    state: () => ({
        nodes: [],
        edges: [],
        loading: false,
        error: null,
        validation: null
    }),

    getters: {
        isolatedNodes(state) {
            const connectedNodeIds = new Set();
            state.edges.forEach(edge => {
                connectedNodeIds.add(edge.fromNodeId);
                connectedNodeIds.add(edge.toNodeId);
            });
            return state.nodes.filter(node => !connectedNodeIds.has(node.id));
        },

        interfloorEdges(state) {
            return state.edges.filter(edge => edge.type === 'interfloor');
        }
    },

    actions: {
        async fetchFloorGraph(floorId) {
            this.loading = true;
            this.error = null;
            try {
                const response = await graphService.getFloorGraph(floorId);
                this.nodes = response.nodes || [];
                this.edges = response.edges || [];
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createNode(data) {
            try {
                const node = await graphService.createNode(data);
                this.nodes.push(node);
                return node;
            } catch (error) {
                throw error;
            }
        },

        async updateNode(nodeId, data) {
            try {
                const updated = await graphService.updateNode(nodeId, data);
                const index = this.nodes.findIndex(n => n.id === nodeId);
                if (index !== -1) {
                    this.nodes[index] = { ...this.nodes[index], ...updated };
                }
                return updated;
            } catch (error) {
                throw error;
            }
        },

        async deleteNode(nodeId) {
            try {
                await graphService.deleteNode(nodeId);
                this.nodes = this.nodes.filter(n => n.id !== nodeId);
                this.edges = this.edges.filter(e => e.fromNodeId !== nodeId && e.toNodeId !== nodeId);
            } catch (error) {
                throw error;
            }
        },

        async createEdge(data) {
            try {
                const edge = await graphService.createEdge(data);
                this.edges.push(edge);
                return edge;
            } catch (error) {
                throw error;
            }
        },

        async updateEdge(edgeId, data) {
            try {
                const updated = await graphService.updateEdge(edgeId, data);
                const index = this.edges.findIndex(e => e.id === edgeId);
                if (index !== -1) {
                    this.edges[index] = { ...this.edges[index], ...updated };
                }
                return updated;
            } catch (error) {
                throw error;
            }
        },

        async deleteEdge(edgeId) {
            try {
                await graphService.deleteEdge(edgeId);
                this.edges = this.edges.filter(e => e.id !== edgeId);
            } catch (error) {
                throw error;
            }
        },

        async validateGraph(floorId) {
            try {
                this.validation = await graphService.validateGraph(floorId);
                return this.validation;
            } catch (error) {
                throw error;
            }
        }
    }
});