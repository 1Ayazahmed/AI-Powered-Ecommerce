import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';
import { calculateMovingAverage, calculateSeasonality, predictNextMonthSales } from '../utils/analyticsUtils.js';

export const getAdvancedAnalytics = async (timeRange = 'month') => {
  try {
    // Calculate date range
    const now = new Date();
    let startDate;
    switch (timeRange) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Get all orders within the time range
    const orders = await Order.find({
      createdAt: { $gte: startDate },
      isPaid: true
    }).populate('orderItems.product');

    // 1. Sales Analysis
    const salesAnalysis = await analyzeSales(orders, startDate);

    // 2. Product Performance
    const productPerformance = await analyzeProductPerformance(orders);

    // 3. Category Analysis
    const categoryAnalysis = await analyzeCategories(orders);

    // 4. Predictive Insights
    const predictions = await generatePredictions(orders, productPerformance);

    // 5. Marketing Recommendations
    const marketingInsights = generateMarketingInsights(predictions, productPerformance);

    return {
      salesAnalysis,
      productPerformance,
      categoryAnalysis,
      predictions,
      marketingInsights
    };
  } catch (error) {
    console.error('Error in advanced analytics:', error);
    throw error;
  }
};

const analyzeSales = async (orders, startDate) => {
  // Daily sales data
  const dailySales = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + order.totalPrice;
    return acc;
  }, {});

  // Calculate moving averages
  const movingAverages = calculateMovingAverage(dailySales);

  // Calculate seasonality
  const seasonality = calculateSeasonality(dailySales);

  return {
    dailySales,
    movingAverages,
    seasonality,
    totalSales: Object.values(dailySales).reduce((sum, sales) => sum + sales, 0),
    averageOrderValue: orders.reduce((sum, order) => sum + order.totalPrice, 0) / orders.length
  };
};

const analyzeProductPerformance = async (orders) => {
  const productStats = {};

  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (!productStats[item.product._id]) {
        productStats[item.product._id] = {
          name: item.product.name,
          totalSales: 0,
          quantitySold: 0,
          averagePrice: 0,
          salesTrend: []
        };
      }

      productStats[item.product._id].totalSales += item.price * item.qty;
      productStats[item.product._id].quantitySold += item.qty;
      productStats[item.product._id].salesTrend.push({
        date: order.createdAt,
        sales: item.price * item.qty
      });
    });
  });

  // Calculate trends and growth rates
  Object.keys(productStats).forEach(productId => {
    const stats = productStats[productId];
    stats.averagePrice = stats.totalSales / stats.quantitySold;
    
    // Calculate growth rate
    const sortedTrend = stats.salesTrend.sort((a, b) => a.date - b.date);
    if (sortedTrend.length > 1) {
      const firstWeek = sortedTrend.slice(0, Math.ceil(sortedTrend.length / 2));
      const secondWeek = sortedTrend.slice(Math.ceil(sortedTrend.length / 2));
      
      const firstWeekSales = firstWeek.reduce((sum, item) => sum + item.sales, 0);
      const secondWeekSales = secondWeek.reduce((sum, item) => sum + item.sales, 0);
      
      if (firstWeekSales === 0) {
        stats.growthRate = 0; // Handle division by zero
      } else {
        stats.growthRate = ((secondWeekSales - firstWeekSales) / firstWeekSales) * 100;
      }
    } else {
      stats.growthRate = 0; // Not enough data to calculate growth
    }
  });

  return productStats;
};

const analyzeCategories = async (orders) => {
  const categoryStats = {};

  orders.forEach(order => {
    order.orderItems.forEach(item => {
      if (!categoryStats[item.category]) {
        categoryStats[item.category] = {
          totalSales: 0,
          quantitySold: 0,
          products: new Set(),
          salesTrend: []
        };
      }

      categoryStats[item.category].totalSales += item.price * item.qty;
      categoryStats[item.category].quantitySold += item.qty;
      categoryStats[item.category].products.add(item.product._id);
      categoryStats[item.category].salesTrend.push({
        date: order.createdAt,
        sales: item.price * item.qty
      });
    });
  });

  // Calculate category metrics
  Object.keys(categoryStats).forEach(category => {
    const stats = categoryStats[category];
    stats.productCount = stats.products.size;
    stats.averageOrderValue = stats.totalSales / stats.quantitySold;
    
    // Calculate category growth
    const sortedTrend = stats.salesTrend.sort((a, b) => a.date - b.date);
    if (sortedTrend.length > 1) {
      const firstHalf = sortedTrend.slice(0, Math.ceil(sortedTrend.length / 2));
      const secondHalf = sortedTrend.slice(Math.ceil(sortedTrend.length / 2));
      
      const firstHalfSales = firstHalf.reduce((sum, item) => sum + item.sales, 0);
      const secondHalfSales = secondHalf.reduce((sum, item) => sum + item.sales, 0);
      
      if (firstHalfSales === 0) {
        stats.growthRate = 0; // Handle division by zero
      } else {
        stats.growthRate = ((secondHalfSales - firstHalfSales) / firstHalfSales) * 100;
      }
    } else {
      stats.growthRate = 0; // Not enough data to calculate growth
    }
  });

  return categoryStats;
};

const generatePredictions = async (orders, productPerformance) => {
  // Predict next month's sales
  const nextMonthSales = predictNextMonthSales(orders);

  // Identify top performing products
  const topProducts = Object.entries(productPerformance)
    .sort(([, a], [, b]) => b.totalSales - a.totalSales)
    .slice(0, 5)
    .map(([id, stats]) => {
      // Calculate raw predicted sales
      const rawPredictedSales = stats.totalSales * (1 + (stats.growthRate / 100));

      return {
        id,
        name: stats.name,
        // Ensure predictedSales is a valid number, default to 0 if not
        predictedSales: isNaN(rawPredictedSales) || !isFinite(rawPredictedSales) ? 0 : rawPredictedSales,
        confidence: calculateConfidenceScore(stats)
      };
    });

  console.log('Top products before returning:', topProducts);

  return {
    nextMonthSales,
    topProducts,
    predictedGrowth: calculateOverallGrowth(orders)
  };
};

const generateMarketingInsights = (predictions, productPerformance) => {
  const insights = {
    recommendedProducts: [],
    campaignSuggestions: [],
    budgetAllocation: {}
  };

  // Identify products with high growth potential
  const highGrowthProducts = Object.entries(productPerformance)
    .filter(([, stats]) => stats.growthRate > 0)
    .sort(([, a], [, b]) => b.growthRate - a.growthRate)
    .slice(0, 3);

  insights.recommendedProducts = highGrowthProducts.map(([id, stats]) => ({
    id,
    name: stats.name,
    growthRate: stats.growthRate,
    suggestedAction: generateProductAction(stats)
  }));

  // Generate campaign suggestions
  insights.campaignSuggestions = generateCampaignSuggestions(predictions, highGrowthProducts);

  // Suggest budget allocation
  insights.budgetAllocation = calculateBudgetAllocation(predictions, productPerformance);

  return insights;
};

// Helper functions
const calculateConfidenceScore = (stats) => {
  // Implement confidence score calculation based on data quality and consistency
  return Math.min(100, Math.max(0, 
    (stats.quantitySold * 0.4) + 
    (Math.abs(stats.growthRate) * 0.3) + 
    (stats.salesTrend.length * 0.3)
  ));
};

const calculateOverallGrowth = (orders) => {
  // Implement overall growth calculation
  const sortedOrders = orders.sort((a, b) => a.createdAt - b.createdAt);
  const midPoint = Math.floor(sortedOrders.length / 2);
  
  const firstHalf = sortedOrders.slice(0, midPoint);
  const secondHalf = sortedOrders.slice(midPoint);
  
  const firstHalfSales = firstHalf.reduce((sum, order) => sum + order.totalPrice, 0);
  const secondHalfSales = secondHalf.reduce((sum, order) => sum + order.totalPrice, 0);
  
  if (firstHalfSales === 0) {
    return 0; // Return 0 growth if there were no sales in the first half
  } else {
    return ((secondHalfSales - firstHalfSales) / firstHalfSales) * 100;
  }
};

const generateProductAction = (stats) => {
  if (stats.growthRate > 20) {
    return 'Increase inventory and marketing budget';
  } else if (stats.growthRate > 10) {
    return 'Maintain current strategy';
  } else {
    return 'Review pricing and marketing strategy';
  }
};

const generateCampaignSuggestions = (predictions, highGrowthProducts) => {
  return highGrowthProducts.map(([id, stats]) => ({
    productId: id,
    productName: stats.name,
    suggestedCampaign: {
      type: 'Facebook',
      duration: '2 weeks',
      budget: calculateCampaignBudget(stats),
      targetAudience: 'Previous buyers and similar interests',
      keyMessage: `Highlight ${stats.name}'s growing popularity and positive trends`
    }
  }));
};

const calculateCampaignBudget = (stats) => {
  // Implement campaign budget calculation based on product performance
  return Math.min(1000, Math.max(100, stats.totalSales * 0.1));
};

const calculateBudgetAllocation = (predictions, productPerformance) => {
  const totalSales = Object.values(productPerformance)
    .reduce((sum, stats) => sum + stats.totalSales, 0);

  return Object.entries(productPerformance)
    .reduce((acc, [id, stats]) => {
      acc[id] = {
        productName: stats.name,
        suggestedBudget: (stats.totalSales / totalSales) * 100,
        priority: stats.growthRate > 10 ? 'High' : 'Medium'
      };
      return acc;
    }, {});
}; 