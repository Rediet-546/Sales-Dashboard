import { Router } from 'express';
import { ShopController } from '../controllers/shopController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// Super Admin only
router.post('/', requireRole('SUPER_ADMIN'), ShopController.create);
router.get('/', requireRole('SUPER_ADMIN'), ShopController.getAll);
router.delete('/:id', requireRole('SUPER_ADMIN'), ShopController.delete);

// Admin & Super Admin
router.get('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), ShopController.getById);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), ShopController.update);
router.get('/:id/dashboard', requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), ShopController.getDashboard);

export default router;