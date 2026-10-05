import { Router } from 'express';
import * as publishCtrl from '../controllers/admin/publish.controller';
import * as graphCtrl from '../controllers/admin/graph.controller';
import * as auditCtrl from '../controllers/admin/audit.controller';
import * as userCtrl from '../controllers/admin/user.controller';
import * as floorCtrl from '../controllers/admin/floor.controller';
import * as objectCtrl from '../controllers/admin/object.controller';
import * as categoryCtrl from '../controllers/admin/category.controller';
import { uploadFloorPlan } from '../middleware/upload.middleware';
import * as settingsCtrl from '../controllers/admin/settings.controller';

const router = Router();

// ============================================================
// DASHBOARD & STATISTICS
// ============================================================
router.get('/dashboard', (req, res) => res.json({ success: true, data: { message: 'Dashboard data' } }));
router.get('/statistics', (req, res) => res.json({ success: true, data: { message: 'Stats data' } }));

// === ДОБАВЬТЕ ЭТИ ДВЕ СТРОКИ ===
router.get('/settings', settingsCtrl.getSettings);
router.get('/settings/api-info', settingsCtrl.getApiInfo);

// ============================================================
// ЭТАЖИ (Floors)
// ============================================================
router.get('/floors', floorCtrl.getAll);
router.get('/floors/:id', floorCtrl.getOne); // <-- Теперь существует
router.post('/floors', floorCtrl.create);
router.put('/floors/:id', floorCtrl.update);
router.delete('/floors/:id', floorCtrl.deleteFloor); // <-- Используем deleteFloor
router.post('/floors/:id/plan', uploadFloorPlan, floorCtrl.uploadPlan); // <-- С middleware
router.delete('/floors/:id/plan', floorCtrl.deletePlan); // <-- Теперь существует

// ============================================================
// ПОМЕЩЕНИЯ (Rooms) - SpatialObject с type IN ('classroom', 'laboratory', 'office')
// ============================================================
router.get('/rooms', (req, res, next) => { req.query.typeFilter = 'room'; next(); }, objectCtrl.getAll);
router.get('/rooms/stats', objectCtrl.getStats); // <-- СТАТИСТИКА ПО ПОМЕЩЕНИЯМ
router.get('/rooms/:id', objectCtrl.getOne);
router.post('/rooms', (req, res, next) => { req.body.type = 'classroom'; next(); }, objectCtrl.create);
router.put('/rooms/:id', objectCtrl.update);
router.delete('/rooms/:id', objectCtrl.deleteObject);
// ============================================================
// ИНФОРМАЦИОННЫЕ ОБЪЕКТЫ (Objects) - type IN ('information', 'department', 'other')
// ============================================================
router.get('/objects', (req, res, next) => { req.query.typeFilter = 'info'; next(); }, objectCtrl.getAll);
router.get('/objects/stats', objectCtrl.getStats); // <-- СТАТИСТИКА ПО ОБЪЕКТАМ
router.get('/objects/:id', objectCtrl.getOne);
router.post('/objects', (req, res, next) => { req.body.type = 'information'; next(); }, objectCtrl.create);
router.put('/objects/:id', objectCtrl.update);

router.delete('/objects/:id', objectCtrl.deleteObject);

// ============================================================
// КАТЕГОРИИ (Categories)
// ============================================================
router.get('/categories', categoryCtrl.getAll);
router.get('/categories/:id', categoryCtrl.getOne);
router.post('/categories', categoryCtrl.create);
router.put('/categories/:id', categoryCtrl.update);
router.delete('/categories/:id', categoryCtrl.deleteCategory);

// ============================================================
// МЕРОПРИЯТИЯ (Events) - заглушки, реализация по аналогии
// ============================================================
router.get('/events', (req, res) => res.json({ success: true, data: [] }));
router.get('/events/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/events', (req, res) => res.status(201).json({ success: true, data: {} }));
router.put('/events/:id', (req, res) => res.json({ success: true, data: {} }));
router.delete('/events/:id', (req, res) => res.json({ success: true, data: { message: 'Deleted' } }));

// ============================================================
// ПЕРСОНАЛИИ (Persons) - заглушки
// ============================================================
router.get('/persons', (req, res) => res.json({ success: true, data: [] }));
router.get('/persons/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/persons', (req, res) => res.status(201).json({ success: true, data: {} }));
router.put('/persons/:id', (req, res) => res.json({ success: true, data: {} }));
router.delete('/persons/:id', (req, res) => res.json({ success: true, data: { message: 'Deleted' } }));

// ============================================================
// НАВИГАЦИОННЫЙ ГРАФ
// ============================================================
router.get('/graph', graphCtrl.getFullGraph);
router.get('/graph/nodes', graphCtrl.getNodes);
router.post('/graph/nodes', graphCtrl.createNode);
router.put('/graph/nodes/:id', graphCtrl.updateNode);
router.delete('/graph/nodes/:id', graphCtrl.deleteNode);
router.get('/graph/edges', graphCtrl.getEdges);
router.post('/graph/edges', graphCtrl.createEdge);
router.put('/graph/edges/:id', graphCtrl.updateEdge);
router.delete('/graph/edges/:id', graphCtrl.deleteEdge);
router.post('/graph/validate', graphCtrl.validate);

router.post('/graph/edges', graphCtrl.createEdge); // <-- Теперь существует
router.put('/graph/edges/:id', graphCtrl.updateEdge); // <-- Теперь существует
router.delete('/graph/edges/:id', graphCtrl.deleteEdge); // <-- Теперь существует

// ============================================================
// МЕДИАТЕКА - заглушки
// ============================================================
router.get('/media', (req, res) => res.json({ success: true, data: [] }));
router.get('/media/:id', (req, res) => res.json({ success: true, data: {} }));
router.post('/media', (req, res) => res.status(201).json({ success: true, data: {} }));
router.post('/media/upload', (req, res) => res.json({ success: true, data: { url: '/uploads/mock.jpg' } }));
router.delete('/media/:id', (req, res) => res.json({ success: true, data: { message: 'Deleted' } }));

// ============================================================
// ПОЛЬЗОВАТЕЛИ И РОЛИ
// ============================================================
router.get('/users', userCtrl.getAll);
router.get('/users/:id', userCtrl.getOne);
router.post('/users', userCtrl.create);
router.put('/users/:id', userCtrl.update);
router.delete('/users/:id', userCtrl.deleteUser);
router.post('/users/:id/password', userCtrl.resetPassword);
router.put('/users/:id/role', userCtrl.updateRole);
router.get('/roles', (req, res) => res.json({ success: true, data: ['student', 'teacher', 'employee', 'applicant', 'guest', 'admin'] }));
router.get('/permissions', (req, res) => res.json({ success: true, data: ['read', 'write', 'publish', 'admin'] }));

// ============================================================
// ЖУРНАЛ ИЗМЕНЕНИЙ (Audit)
// ============================================================
router.get('/audit', auditCtrl.getAll);
router.get('/audit/:id', auditCtrl.getOne);

// ============================================================
// ПУБЛИКАЦИЯ
// ============================================================
router.post('/publish', publishCtrl.publish);
router.get('/publication/status', publishCtrl.getStatus);

export default router;