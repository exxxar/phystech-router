import { PrismaClient } from '@prisma/client';
import { getGraph } from './graph.service';
import { aStar } from '../algorithms/a-star';
import { dijkstra } from '../algorithms/dijkstra';
import { buildRouteSteps } from '../algorithms/route-builder';

const prisma = new PrismaClient();

export async function calculateRoute(
    fromNodeId: number,
    toObjectId: number,
    algorithm: 'astar' | 'dijkstra' = 'astar',
    preferences: any = {},
    userId?: number
) {
    const graph = await getGraph();

    // Находим узел, привязанный к целевому объекту
    const targetNode = await prisma.graphNode.findFirst({
        where: { objectId: toObjectId },
        orderBy: { id: 'asc' }
    });

    if (!targetNode) {
        throw new Error('Целевой объект не имеет связанного узла графа');
    }

    let result;
    if (algorithm === 'dijkstra') {
        result = dijkstra(graph, fromNodeId, targetNode.id, preferences);
    } else {
        result = aStar(graph, fromNodeId, targetNode.id, preferences);
    }

    if (result.path.length === 0) {
        throw new Error('Маршрут не найден');
    }

    const steps = buildRouteSteps(graph, result.path);
    const floors = [...new Set(steps.map(s => s.floor))];

    // Сохранение в БД (опционально, если пользователь авторизован)
    let routeId = null;
    if (userId) {
        const route = await prisma.route.create({
            data: {
                userId,
                fromNodeId,
                toObjectId,
                algorithm,
                distance: result.distance,
                duration: Math.ceil(result.distance * 0.8), // ~1.2 м/сек
                metadata: { visitedNodes: result.visitedNodes, executionTime: result.executionTime },
                steps: {
                    create: steps.map(s => ({
                        order: s.order,
                        nodeId: s.nodeId,
                        instruction: s.instruction,
                        distance: s.distance,
                        floorId: s.floor,
                    }))
                }
            }
        });
        routeId = route.id;
    }

    return {
        id: routeId,
        distance: result.distance,
        duration: Math.ceil(result.distance * 0.8),
        algorithm,
        floors,
        nodes: result.path,
        steps,
        metrics: {
            visitedNodes: result.visitedNodes,
            executionTime: result.executionTime
        }
    };
}