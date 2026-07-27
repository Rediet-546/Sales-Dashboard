import { Router } from 'express';
import { ReportController } from '../controllers/reportController';
import { auth } from '../middleware/auth';

const router = Router();

// All report routes require authentication
router.use(auth);

// CRUD operations
router.post('/', ReportController.createReport);
router.get('/user', ReportController.getUserReports);
router.get('/:id', ReportController.getReportById);
router.put('/:id', ReportController.updateReport);
router.delete('/:id', ReportController.deleteReport);

// Report generation and templates
router.post('/generate', ReportController.generateReportFromTemplate);
router.get('/templates', ReportController.getReportTemplates);

// Export and download
router.get('/:id/download', ReportController.downloadReport);
router.post('/export', ReportController.exportReport);

// Scheduling
router.post('/schedule', ReportController.scheduleReport);
router.get('/scheduled', ReportController.getScheduledReports);
router.delete('/scheduled/:id', ReportController.deleteScheduledReport);

// Sharing and analytics
router.post('/:id/share', ReportController.shareReport);
router.get('/:id/analytics', ReportController.getReportAnalytics);

export default router;