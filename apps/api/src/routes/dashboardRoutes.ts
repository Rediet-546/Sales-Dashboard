import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController';
import { auth } from '../middleware/auth';

const router = Router();

// All dashboard routes require authentication
router.use(auth);

router.post('/', DashboardController.createDashboard);
router.get('/user', DashboardController.getUserDashboards);
router.get('/all', DashboardController.getAllDashboards);
router.get('/:id', DashboardController.getDashboardById);
router.get('/:id/analytics', DashboardController.getDashboardAnalytics);
router.put('/:id', DashboardController.updateDashboard);
router.delete('/:id', DashboardController.deleteDashboard);

export default router;