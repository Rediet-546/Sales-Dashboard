import { Router } from 'express';
import { WhatIfController } from '../controllers/whatIfController';
import { auth } from '../middleware/auth';

const router = Router();

// All What-If analysis routes require authentication
router.use(auth);

// Analysis endpoints
router.post('/analyze', WhatIfController.analyzeScenario);
router.post('/predict', WhatIfController.predictOutcome);
router.post('/compare', WhatIfController.compareScenarios);
router.post('/optimize', WhatIfController.optimizeMetrics);
router.post('/sensitivity', WhatIfController.sensitivityAnalysis);
router.post('/monte-carlo', WhatIfController.monteCarloSimulation);
router.post('/recommendations', WhatIfController.getRecommendations);

// Scenario management
router.post('/save', WhatIfController.saveScenario);
router.get('/scenarios', WhatIfController.getSavedScenarios);
router.delete('/scenarios/:id', WhatIfController.deleteScenario);

// Export and history
router.post('/export', WhatIfController.exportAnalysis);
router.get('/history', WhatIfController.getAnalysisHistory);

export default router;