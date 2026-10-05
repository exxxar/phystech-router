import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function validateGraph() {
    const nodes = await prisma.graphNode.findMany();
    const edges = await prisma.graphEdge.findMany();
    const errors: string[] = [];

    const nodeIds = new Set(nodes.map(n => n.id));
    const connectedNodeIds = new Set([
        ...edges.map(e => e.fromNodeId),
        ...edges.map(e => e.toNodeId)
    ]);

    // 1. Проверка на изолированные узлы (без ребер)
    for (const node of nodes) {
        if (!connectedNodeIds.has(node.id)) {
            errors.push(`Изолированный узел ID: ${node.id} (нет связей)`);
        }
    }

    // 2. Проверка на битые ссылки в ребрах
    for (const edge of edges) {
        if (!nodeIds.has(edge.fromNodeId)) {
            errors.push(`Ребро ID ${edge.id}: отсутствует fromNodeId ${edge.fromNodeId}`);
        }
        if (!nodeIds.has(edge.toNodeId)) {
            errors.push(`Ребро ID ${edge.id}: отсутствует toNodeId ${edge.toNodeId}`);
        }
    }

    // 3. Проверка привязки узлов к объектам
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