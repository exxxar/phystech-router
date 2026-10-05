export interface GraphNodeData {
    id: number;
    x: number;
    y: number;
    floorId: number;
    type: string;
}

export interface GraphEdgeData {
    to: number;
    distance: number;
    cost: number;
    type: string;
    accessible: boolean;
    bidirectional: boolean;
}

export class Graph {
    private nodes: Map<number, GraphNodeData> = new Map();
    private adjacency: Map<number, GraphEdgeData[]> = new Map();

    addNode(node: GraphNodeData) {
        this.nodes.set(node.id, node);
        if (!this.adjacency.has(node.id)) {
            this.adjacency.set(node.id, []);
        }
    }

    addEdge(fromId: number, toId: number, edge: GraphEdgeData) {
        if (!this.adjacency.has(fromId)) this.adjacency.set(fromId, []);
        this.adjacency.get(fromId)!.push(edge);

        if (edge.bidirectional) {
            if (!this.adjacency.has(toId)) this.adjacency.set(toId, []);
            this.adjacency.get(toId)!.push({
                ...edge,
                to: fromId,
            });
        }
    }

    getNode(id: number): GraphNodeData | undefined {
        return this.nodes.get(id);
    }

    getNeighbors(id: number): GraphEdgeData[] {
        return this.adjacency.get(id) || [];
    }

    getAllNodes(): GraphNodeData[] {
        return Array.from(this.nodes.values());
    }
}

export function heuristic(node1: GraphNodeData, node2: GraphNodeData): number {
    // Евклидово расстояние
    return Math.sqrt(Math.pow(node2.x - node1.x, 2) + Math.pow(node2.y - node1.y, 2));
}