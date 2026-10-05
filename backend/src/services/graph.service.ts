import { PrismaClient } from '@prisma/client';
import { Graph } from '../algorithms/graph';
import { env } from '../config/env';

const prisma = new PrismaClient();

let cachedGraph: Graph | null = null;
let cacheVersion: string | null = null;

export async function getGraph(): Promise<Graph> {
    // В реальном приложении здесь проверка версии SpatialModelVersion
    if (cachedGraph) return cachedGraph;

    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();

    const graph = new Graph();
    for (const node of nodes) {
        graph.addNode({
            id: node.id,
            x: node.x,
            y: node.y,
            floorId: node.floorId,
            type: node.type,
        });
    }

    for (const edge of edges) {
        let cost = edge.distance;
        if (edge.type === 'stairs') cost += env.ROUTE_STAIR_PENALTY;
        if (!edge.accessible) cost += env.ROUTE_INACCESSIBLE_PENALTY;

        graph.addEdge(edge.fromNodeId, edge.toNodeId, {
            to: edge.toNodeId,
            distance: edge.distance,
            cost,
            type: edge.type,
            accessible: edge.accessible,
            bidirectional: edge.bidirectional,
        });
    }

    cachedGraph = graph;
    return graph;
}

export async function invalidateGraphCache() {
    cachedGraph = null;
}

export async function validateGraph() {
    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();
    const errors: string[] = [];

    const nodeIds = new Set(nodes.map(n => n.id));

    // 1. Проверка на изолированные узлы (без ребер)
    const connectedNodeIds = new Set([
        ...edges.map(e => e.fromNodeId),
        ...edges.map(e => e.toNodeId)
    ]);

    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            errors.push(`Изолированный узел ID: ${node.id} (нет связей)`);
        }
    }

    // 2. Проверка на битые ссылки в ребрах
    for (const edge of edges) {
        if (!nodeIds.has(edge.fromNodeId)) errors.push(`Ребро ID ${edge.id}: отсутствует fromNodeId ${edge.fromNodeId}`);
        if (!nodeIds.has(edge.toNodeId)) errors.push(`Ребро ID ${edge.id}: отсутствует toNodeId ${edge.toNodeId}`);
    }

    // 3. Проверка привязки узлов к опубликованным объектам (если узел представляет объект)
    for (const node of nodes) {
        if (node.objectId) {
            const obj = await prisma.spatialObject.findUnique({ where: { id: node.objectId } });
            if (!obj) {
                errors.push(`Узел ID ${node.id} ссылается на несуществующий объект ID ${node.objectId}`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        stats: { totalNodes: nodes.length, totalEdges: edges.length }
    };
}