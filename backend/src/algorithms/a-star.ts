import { Graph, GraphNodeData, heuristic } from './graph';

interface PriorityQueueItem {
    nodeId: number;
    fScore: number;
}

export function aStar(
    graph: Graph,
    startNodeId: number,
    targetNodeId: number,
    preferences: { avoidStairs?: boolean; accessibleOnly?: boolean } = {}
): { path: number[]; distance: number; visitedNodes: number; executionTime: number } {
    const startTime = performance.now();

    const openSet: PriorityQueueItem[] = [{ nodeId: startNodeId, fScore: 0 }];
    const cameFrom = new Map<number, number>();
    const gScore = new Map<number, number>();
    gScore.set(startNodeId, 0);

    let visitedNodes = 0;

    while (openSet.length > 0) {
        // Сортировка по fScore (имитация Min-Priority Queue)
        openSet.sort((a, b) => a.fScore - b.fScore);
        const current = openSet.shift()!.nodeId;
        visitedNodes++;

        if (current === targetNodeId) {
            const path = reconstructPath(cameFrom, current);
            return {
                path,
                distance: gScore.get(current) || 0,
                visitedNodes,
                executionTime: performance.now() - startTime
            };
        }

        const neighbors = graph.getNeighbors(current);
        for (const edge of neighbors) {
            if (preferences.accessibleOnly && !edge.accessible) continue;
            if (preferences.avoidStairs && edge.type === 'stairs') continue;

            const neighborNode = graph.getNode(edge.to)!;
            const startNode = graph.getNode(startNodeId)!;

            const tentativeGScore = (gScore.get(current) || 0) + edge.cost;

            if (tentativeGScore < (gScore.get(edge.to) || Infinity)) {
                cameFrom.set(edge.to, current);
                gScore.set(edge.to, tentativeGScore);
                const fScore = tentativeGScore + heuristic(neighborNode, startNode); // Ошибка в эвристике: должно быть к targetNode
                // Исправленная эвристика:
                const targetNode = graph.getNode(targetNodeId)!;
                const correctFScore = tentativeGScore + heuristic(neighborNode, targetNode);

                if (!openSet.some(item => item.nodeId === edge.to)) {
                    openSet.push({ nodeId: edge.to, fScore: correctFScore });
                }
            }
        }
    }

    return { path: [], distance: 0, visitedNodes, executionTime: performance.now() - startTime };
}

function reconstructPath(cameFrom: Map<number, number>, current: number): number[] {
    const path = [current];
    while (cameFrom.has(current)) {
        current = cameFrom.get(current)!;
        path.unshift(current);
    }
    return path;
}