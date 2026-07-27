import { Router } from 'express';
import { AlertController } from '../controllers/alertController';
import { auth } from '../middleware/auth';

const router = Router();

// All alert routes require authentication
router.use(auth);

router.post('/', AlertController.createAlert);
router.get('/user', AlertController.getUserAlerts);
router.get('/active', AlertController.getActiveAlerts);
router.get('/check/:metricId', AlertController.checkAlertTriggers);
router.put('/:id', AlertController.updateAlert);
router.patch('/:id/status', AlertController.toggleAlertStatus);
router.delete('/:id', AlertController.deleteAlert);

export default router;