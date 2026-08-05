import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { auth, requireRole } from '../middleware/auth';

const router = Router();

// Get current user profile
router.get('/profile', auth, UserController.getProfile);

// Update user profile
router.put('/profile', auth, UserController.updateProfile);

// Get user's team members
router.get('/team', auth, UserController.getTeamMembers);

// Get user's sales records
router.get('/sales', auth, UserController.getSalesRecords);

// Get user's activity log
router.get('/activities', auth, UserController.getActivities);

// Admin only - get all users
router.get('/', auth, requireRole('admin'), UserController.getAllUsers);

// Admin only - update user role
router.put('/:id/role', auth, requireRole('admin'), UserController.updateUserRole);

export default router;