import { Graph } from './graph';

export function dijkstra(
    graph: Graph,
    startNodeId: number,
    targetNodeId: number,
    preferences: { avoidStairs?: boolean; accessibleOnly?: boolean } = {}
): { path: number[]; distance: number; visitedNodes: number; executionTime: number } {
    const startTime = performance.now();

    const unvisited = new Set<number>();
    const distance = new Map<number, number>();
    const previous = new Map<number, number>();

    for (const node of graph.getAllNodes()) {
        unvisited.add(node.id);
        distance.set(node.id, Infinity);
    }
    distance.set(startNodeId, 0);

    let visitedNodes = 0;

    while (unvisited.size > 0) {
        let current = -1;
        let minDist = Infinity;
        for (const node of unvisited) {
            if (distance.get(node)! < minDist) {
                minDist = distance.get(node)!;
                current = node;
            }
        }

        if (current === -1 || current === targetNodeId) break;

        unvisited.delete(current);
        visitedNodes++;

        const neighbors = graph.getNeighbors(current);
        for (const edge of neighbors) {
            if (preferences.accessibleOnly && !edge.accessible) continue;
            if (preferences.avoidStairs && edge.type === 'stairs') continue;

            const alt = distance.get(current)! + edge.cost;
            if (alt < distance.get(edge.to)!) {
                distance.set(edge.to, alt);
                previous.set(edge.to, current);
            }
        }
    }

    const path: number[] = [];
    let curr = targetNodeId;
    if (distance.get(curr) !== Infinity) {
        while (curr !== -1) {
            path.unshift(curr);
            curr = previous.get(curr) || -1;
        }
    }

    return {
        path,
        distance: distance.get(targetNodeId) === Infinity ? 0 : distance.get(targetNodeId)!,
        visitedNodes,
        executionTime: performance.now() - startTime
    };
}