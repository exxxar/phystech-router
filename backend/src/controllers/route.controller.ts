import { Request, Response, NextFunction } from 'express';
import { calculateRoute } from '../services/route.service';
import { aStar } from '../algorithms/a-star';
import { dijkstra } from '../algorithms/dijkstra';
import { getGraph } from '../services/graph.service';

export const createRoute = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fromNodeId, toObjectId, algorithm = 'astar', preferences = {} } = req.body;
        const userId = (req as any).user?.id;

        const result = await calculateRoute(fromNodeId, toObjectId, algorithm, preferences, userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

export const compareAlgorithms = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { fromNodeId, toNodeId } = req.body;
        const graph = await getGraph();

        const astarResult = aStar(graph, fromNodeId, toNodeId);
        const dijkstraResult = dijkstra(graph, fromNodeId, toNodeId);

        res.json({
            success: true,
            data: {
                astar: {
                    distance: astarResult.distance,
                    executionTime: astarResult.executionTime,
                    visitedNodes: astarResult.visitedNodes
                },
                dijkstra: {
                    distance: dijkstraResult.distance,
                    executionTime: dijkstraResult.executionTime,
                    visitedNodes: dijkstraResult.visitedNodes
                }
            }
        });
    } catch (error) {
        next(error);
    }
};