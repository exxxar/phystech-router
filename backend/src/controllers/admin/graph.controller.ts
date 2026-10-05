import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { validateGraph } from '../../services/admin/graph.service'; // Используем функцию из Части 1

const prisma = new PrismaClient();

export const getFullGraph = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nodes = await prisma.graphNode.findMany({ include: { object: true, floor: true } });
        const edges = await prisma.graphEdge.findMany();
        res.json({ success: true, data: { nodes, edges } });
    } catch (error) { next(error); }
};

export const getNodes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const nodes = await prisma.graphNode.findMany({ include: { object: true } });
        res.json({ success: true, data: nodes });
    } catch (error) { next(error); }
};

export const createNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const node = await prisma.graphNode.create({ data: req.body });
        res.status(201).json({ success: true, data: node });
    } catch (error) { next(error); }
};

export const updateNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const node = await prisma.graphNode.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json({ success: true, data: node });
    } catch (error) { next(error); }
};

export const deleteNode = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.graphNode.delete({ where: { id: Number(req.params.id) } });
        res.json({ success: true, data: { message: 'Узел удален' } });
    } catch (error) { next(error); }
};

// Аналогичные CRUD функции для Edges (getEdges, createEdge, updateEdge, deleteEdge)
export const getEdges = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const edges = await prisma.graphEdge.findMany({ include: { fromNode: true, toNode: true } });
        res.json({ success: true, data: edges });
    } catch (error) { next(error); }
};


export const validate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await validateGraph();
        res.json({ success: true, data: result });
    } catch (error) { next(error); }
};

// ============================================================
// СОЗДАТЬ РЕБРО ГРАФА
// ============================================================
export const createEdge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const edge = await prisma.graphEdge.create({
            data: {
                fromNodeId: Number(req.body.fromNodeId),
                toNodeId: Number(req.body.toNodeId),
                distance: Number(req.body.distance),
                cost: Number(req.body.cost),
                type: req.body.type,
                accessible: req.body.accessible ?? true,
                bidirectional: req.body.bidirectional ?? true
            }
        });
        res.status(201).json({ success: true, data: edge });
    } catch (error) {
        next(error);
    }
};

// ============================================================
// ОБНОВИТЬ РЕБРО ГРАФА
// ============================================================
export const updateEdge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        const edge = await prisma.graphEdge.update({
            where: { id },
            data: {
                distance: req.body.distance !== undefined ? Number(req.body.distance) : undefined,
                cost: req.body.cost !== undefined ? Number(req.body.cost) : undefined,
                accessible: req.body.accessible,
                bidirectional: req.body.bidirectional
            }
        });
        res.json({ success: true, data: edge });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'EDGE_NOT_FOUND', message: 'Ребро графа не найдено' }
            });
        }
        next(error);
    }
};

// ============================================================
// УДАЛИТЬ РЕБРО ГРАФА
// ============================================================
export const deleteEdge = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = Number(req.params.id);
        await prisma.graphEdge.delete({ where: { id } });
        res.json({ success: true, data: { message: 'Ребро графа успешно удалено' } });
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                success: false,
                error: { code: 'EDGE_NOT_FOUND', message: 'Ребро графа не найдено' }
            });
        }
        next(error);
    }
};