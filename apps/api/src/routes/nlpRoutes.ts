import { Router } from 'express';
import { NLPController } from '../controllers/nlpController';
import { auth } from '../middleware/auth';

const router = Router();

// All NLP routes require authentication
router.use(auth);

// Main NLP endpoints
router.post('/query', NLPController.processNaturalLanguageQuery);
router.post('/analyze', NLPController.analyzeData);
router.post('/generate-insights', NLPController.generateInsights);
router.post('/recommendations', NLPController.getRecommendations);
router.post('/chat', NLPController.chatWithData);

// Utility endpoints
router.get('/suggestions', NLPController.getQuerySuggestions);
router.post('/train', NLPController.trainModel);
router.get('/status', NLPController.getModelStatus);
router.post('/export', NLPController.exportAnalysis);

export default router;