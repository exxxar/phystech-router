import { Request, Response, NextFunction } from 'express';
import { getFloors, getFloorById } from '../services/floor.service';

export const listFloors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const floors = await getFloors();
        res.json({ success: true, data: floors });
    } catch (error) {
        next(error);
    }
};

export const getFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const floor = await getFloorById(id);
        res.json({ success: true, data: floor });
    } catch (error) {
        next(error);
    }
};

export const createFloor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const adminUserId = (req as any).user.id;
        const floor = await floorService.createFloor(req.body, adminUserId);
        res.status(201).json({ success: true, data: floor });
    } catch (error) {
        next(error);
    }
};