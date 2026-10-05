import { Router } from 'express';
import { listFloors, getFloor } from '../controllers/floor.controller';

const router = Router();

router.get('/', listFloors);
router.get('/:id', getFloor);

export default router;