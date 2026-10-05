import { apiClient } from './api';
import { mockGraph } from '@/mock';
import type { Route, RouteStep } from '@/types';

function dijkstra(from: string, to: string): { path: string[]; distance: number } | null {
    const graph = mockGraph;
    const dist: Record<string, number> = {};
    const prev: Record<string, string | null> = {};
    const visited = new Set<string>();
    const adj: Record<string, { to: string; d: number }[]> = {};

    graph.nodes.forEach((n) => {
        dist[n.id] = Infinity;
        prev[n.id] = null;
        adj[n.id] = [];
    });
    graph.edges.forEach((e) => {
        if (!e.accessible) return;
        adj[e.from].push({ to: e.to, d: e.distance });
        adj[e.to].push({ to: e.from, d: e.distance });
    });

    dist[from] = 0;
    const queue = new Set(Object.keys(dist));

    while (queue.size) {
        let u: string | null = null;
        let best = Infinity;
        for (const n of queue) if (dist[n] < best) { best = dist[n]; u = n; }
        if (!u || u === to) break;
        queue.delete(u);
        visited.add(u);
        for (const edge of adj[u]) {
            if (visited.has(edge.to)) continue;
            const alt = dist[u] + edge.d;
            if (alt < dist[edge.to]) {
                dist[edge.to] = alt;
                prev[edge.to] = u;
            }
        }
    }

    if (dist[to] === Infinity) return null;
    const path: string[] = [];
    let cur: string | null = to;
    while (cur) { path.unshift(cur); cur = prev[cur]; }
    return { path, distance: dist[to] };
}

function directionFor(from: string, to: string): RouteStep['direction'] {
    const a = mockGraph.nodes.find((n) => n.id === from);
    const b = mockGraph.nodes.find((n) => n.id === to);
    if (!a || !b) return 'straight';
    if (a.floorId !== b.floorId) return a.floorId < b.floorId ? 'up' : 'down';
    const dx = b.x - a.x;
    if (Math.abs(dx) < 10) return 'straight';
    return dx > 0 ? 'right' : 'left';
}

export const routeService = {
    build: (from: string, to: string) =>
        apiClient.post<Route>('/routes', { from, to }, async () => {
            const result = dijkstra(from, to);
            if (!result) throw new Error('Маршрут невозможен');
            const steps: RouteStep[] = result.path.map((nodeId, i) => {
                const node = mockGraph.nodes.find((n) => n.id === nodeId)!;
                const prevNode = i > 0 ? mockGraph.nodes.find((n) => n.id === result.path[i - 1]) : null;
                const nextNode = i < result.path.length - 1 ? mockGraph.nodes.find((n) => n.id === result.path[i + 1]) : null;
                let instruction = 'Двигайтесь к следующей точке';
                if (node.type === 'stairs' && prevNode && prevNode.floorId !== node.floorId) {
                    instruction = `Поднимитесь на ${node.floorId} этаж по лестнице`;
                } else if (node.type === 'room' && node.objectId) {
                    instruction = `Вы прибыли: ${node.objectId}`;
                } else if (nextNode) {
                    const dir = directionFor(nodeId, nextNode.id);
                    if (dir === 'left') instruction = 'Поверните налево';
                    else if (dir === 'right') instruction = 'Поверните направо';
                    else instruction = 'Идите прямо';
                }
                return {
                    order: i + 1,
                    instruction,
                    distance: i > 0 ? 50 : 0,
                    floor: node.floorId,
                    direction: directionFor(nodeId, nextNode?.id || nodeId),
                    nodeId,
                };
            });
            const floors = Array.from(new Set(result.path.map((id) => mockGraph.nodes.find((n) => n.id === id)!.floorId)));
            return {
                id: `route_${Date.now()}`,
                from,
                to,
                distance: result.distance,
                duration: Math.ceil(result.distance / 60),
                floors,
                steps,
                nodes: result.path,
                createdAt: new Date().toISOString(),
            };
        }),
    getById: (id: string) => apiClient.get<Route>(`/routes/${id}`, async () => {
        throw new Error('Маршрут не найден');
    }),
};