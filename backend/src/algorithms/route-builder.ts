import { Graph, GraphNodeData } from './graph';

export interface RouteStepData {
    order: number;
    instruction: string;
    distance: number;
    floor: number;
    nodeId: number;
}

export function buildRouteSteps(graph: Graph, path: number[]): RouteStepData[] {
    const steps: RouteStepData[] = [];
    if (path.length < 2) return steps;

    let currentFloor = graph.getNode(path[0])!.floorId;
    let stepDistance = 0;
    let order = 1;

    for (let i = 1; i < path.length; i++) {
        const prevNode = graph.getNode(path[i - 1])!;
        const currNode = graph.getNode(path[i])!;
        const edges = graph.getNeighbors(path[i - 1]);
        const edge = edges.find(e => e.to === currNode.id)!;

        stepDistance += edge.distance;

        let instruction = "Идите прямо";
        if (edge.type === 'stairs') {
            instruction = currNode.floorId > prevNode.floorId
                ? `Поднимитесь на ${currNode.floorId} этаж по лестнице`
                : `Спуститесь на ${currNode.floorId} этаж по лестнице`;
            steps.push({ order: order++, instruction, distance: stepDistance, floor: currNode.floorId, nodeId: currNode.id });
            stepDistance = 0; // Сброс расстояния после перехода
            currentFloor = currNode.floorId;
        } else if (i === path.length - 1) {
            instruction = "Объект находится здесь";
            steps.push({ order: order++, instruction, distance: stepDistance, floor: currNode.floorId, nodeId: currNode.id });
        }
    }

    // Если остались шаги без перехода по лестнице
    if (stepDistance > 0 && steps[steps.length - 1]?.instruction !== "Объект находится здесь") {
        const lastNode = graph.getNode(path[path.length - 1])!;
        steps.push({ order: order++, instruction: "Вы прибыли к пункту назначения", distance: stepDistance, floor: lastNode.floorId, nodeId: lastNode.id });
    }

    return steps;
}