import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(auth);

// Product CRUD
router.post('/', requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), ProductController.create);
router.get('/', ProductController.getAll);
router.get('/my', ProductController.getMyProducts);
router.get('/low-stock', ProductController.getLowStock);
router.get('/:id', ProductController.getById);
router.put('/:id', requireRole('SUPER_ADMIN', 'ADMIN', 'MANAGER'), ProductController.update);
router.delete('/:id', requireRole('SUPER_ADMIN', 'ADMIN'), ProductController.delete);

export default router;