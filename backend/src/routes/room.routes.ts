import { Router, Request, Response } from 'express';

const router = Router();

// Базовый интерфейс для тела запроса (можно расширить по мере развития)
interface RoomRequestBody {
    number: string;
    name: string;
    floorId: number | string;
    type?: string;
    description?: string;
    coordinates?: Record<string, any> | string;
    accessible?: boolean;
    nodeId?: number | string;
}

// GET /rooms - Получить список помещений
router.get('/', (req: Request, res: Response) => {
    // TODO: Заменить на реальный вызов контроллера/сервиса
    res.json({
        success: true,
        data: [], // Пустой массив, пока нет реальных данных
        total: 0
    });
});

// GET /rooms/:id - Получить помещение по ID
router.get('/:id', (req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            id: req.params.id,
            number: '101',
            name: 'Тестовое помещение',
            floorId: 1,
            type: 'office',
            description: 'Описание тестового помещения',
            coordinates: { x: 100, y: 200, width: 50, height: 50 },
            accessible: true,
            nodeId: 42
        }
    });
});

// POST /rooms - Создать новое помещение
router.post('/', (req: Request<{}, any, RoomRequestBody>, res: Response) => {
    res.status(201).json({
        success: true,
        data: {
            id: Date.now().toString(), // Временный ID
            ...req.body
        }
    });
});

// PUT /rooms/:id - Обновить помещение
router.put('/:id', (req: Request<{ id: string }, any, Partial<RoomRequestBody>>, res: Response) => {
    res.json({
        success: true,
        data: {
            id: req.params.id,
            ...req.body
        }
    });
});

// DELETE /rooms/:id - Удалить помещение
router.delete('/:id', (req: Request, res: Response) => {
    res.json({
        success: true,
        message: 'Помещение успешно удалено'
    });
});

export default router;