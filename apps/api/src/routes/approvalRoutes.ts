import { Router } from 'express';
import { ApprovalController } from '../controllers/approvalController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

router.use(auth);

router.post('/', requireRole('MANAGER', 'ADMIN'), ApprovalController.createRequest);
router.get('/', requireRole('MANAGER', 'ADMIN'), ApprovalController.getAllRequests);
router.put('/:id/approve', requireRole('ADMIN'), ApprovalController.approve);
router.put('/:id/reject', requireRole('ADMIN'), ApprovalController.reject);

export default router;