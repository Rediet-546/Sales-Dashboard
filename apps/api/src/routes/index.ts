import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import shopRoutes from './shopRoutes';
import productRoutes from './productRoutes';
import approvalRoutes from './approvalRoutes';
import roleRoutes from './roleRoutes';
import dashboardRoutes from './dashboardRoutes';
import metricRoutes from './metricRoutes';
import alertRoutes from './alertRoutes';
import reportRoutes from './reportRoutes';
import nlpRoutes from './nlpRoutes';
import whatIfRoutes from './whatIfRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/shops', shopRoutes);
router.use('/products', productRoutes);
router.use('/approvals', approvalRoutes);
router.use('/roles', roleRoutes);
router.use('/dashboards', dashboardRoutes);
router.use('/metrics', metricRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);
router.use('/nlp', nlpRoutes);
router.use('/what-if', whatIfRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

export default router;