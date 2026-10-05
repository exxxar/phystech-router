import { Router } from 'express';
import { listObjects, getObject } from '../controllers/object.controller';

const router = Router();

router.get('/', listObjects);
router.get('/:id', getObject);

export default router;