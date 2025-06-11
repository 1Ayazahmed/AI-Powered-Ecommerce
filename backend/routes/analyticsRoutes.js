import express from 'express';
import { getAdvancedAnalytics } from '../services/advancedAnalyticsService.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get advanced analytics
router.get('/advanced', protect, admin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const analytics = await getAdvancedAnalytics(timeRange);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch advanced analytics',
      details: error.message
    });
  }
});

// Get product performance predictions
router.get('/product-predictions', protect, admin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const analytics = await getAdvancedAnalytics(timeRange);
    res.json({
      predictions: analytics.predictions,
      marketingInsights: analytics.marketingInsights
    });
  } catch (error) {
    console.error('Error fetching product predictions:', error);
    res.status(500).json({
      error: 'Failed to fetch product predictions',
      details: error.message
    });
  }
});

// Get sales analysis
router.get('/sales-analysis', protect, admin, async (req, res) => {
  try {
    const { timeRange } = req.query;
    const analytics = await getAdvancedAnalytics(timeRange);
    res.json({
      salesAnalysis: analytics.salesAnalysis,
      categoryAnalysis: analytics.categoryAnalysis
    });
  } catch (error) {
    console.error('Error fetching sales analysis:', error);
    res.status(500).json({
      error: 'Failed to fetch sales analysis',
      details: error.message
    });
  }
});

export default router; 