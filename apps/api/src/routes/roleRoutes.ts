import { Router } from 'express';
import { RoleController } from '../controllers/roleController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication and SUPER_ADMIN role
router.use(auth);
router.use(requireRole('SUPER_ADMIN'));

router.post('/assign-manager/:userId', RoleController.assignManager);
router.put('/role/:userId', RoleController.changeUserRole);
router.get('/managers', RoleController.getTeamManagers);

export default router;