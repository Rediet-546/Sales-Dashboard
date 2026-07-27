import { Router } from 'express';
import { MetricController } from '../controllers/metricController';
import { auth } from '../middleware/auth';

const router = Router();

// All metric routes require authentication
router.use(auth);

router.post('/', MetricController.createMetric);
router.get('/user', MetricController.getMetricsByUser);
router.get('/dashboard/:dashboardId', MetricController.getMetricsByDashboard);
router.get('/category/:category', MetricController.getMetricsByCategory);
router.get('/:id', MetricController.getMetricById);
router.put('/:id', MetricController.updateMetric);
router.delete('/:id', MetricController.deleteMetric);

export default router;