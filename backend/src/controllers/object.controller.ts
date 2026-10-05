import { Request, Response, NextFunction } from 'express';
import { getObjects, getObjectById } from '../services/object.service';

export const listObjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getObjects(req.query);
        res.json({ success: true, data: result.data, meta: result.meta });
    } catch (error) {
        next(error);
    }
};

export const getObject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = parseInt(req.params.id);
        const object = await getObjectById(id);
        res.json({ success: true, data: object });
    } catch (error) {
        next(error);
    }
};