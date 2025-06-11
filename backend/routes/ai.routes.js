import express from 'express';
import dotenv from 'dotenv';
import Product from '../models/productModel.js';
import Order from '../models/orderModel.js';
import axios from 'axios'; // Import axios to call Python backend

dotenv.config();

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  console.log('AI Test route hit!');
  res.send('AI Test route is working!');
});

// Get AI recommendations
router.get('/recommendations', async (req, res) => {
  console.log('Recommendations route handler hit!');
  try {
    // Assuming user information is available in req.user from authentication middleware
    const userId = req.user?._id; 

    if (!userId) {
      console.log('User not authenticated for recommendations');
      // For now, return a default list if user is not logged in or user info is missing
      // In a production app, you might handle this differently (e.g., require login or return popular items)
      const recommendations = await Product.find()
        .sort({ rating: -1 })
        .limit(8)
        .select('name description price rating image category');

      console.log('Returning default recommendations (user not logged in)', recommendations.length);
      return res.json({ recommendations });
    }

    console.log(`Fetching recommendations for user: ${userId}`);

    // Fetch recent orders for the user
    const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(10); // Get last 10 orders

    // Extract relevant info from orders (e.g., product IDs, categories). Adjust based on what your Python model expects.
    const orderItems = userOrders.reduce((items, order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        return items.concat(order.orderItems.map(item => ({
          productId: item.product, // Assuming item.product is the product ID
          category: item.category,
          // Add other relevant fields from order item
        })));
      }
      return items;
    }, []);

    console.log(`Found ${userOrders.length} recent orders with ${orderItems.length} items for user ${userId}`);

    // Call Python backend for personalized recommendations
    // Ensure your Python Flask app is running and accessible at http://localhost:5001 (or wherever it runs)
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001';

    console.log(`Calling Python backend at ${pythonBackendUrl}/get-personalized-recommendations`);
    const pythonResponse = await axios.post(`${pythonBackendUrl}/get-personalized-recommendations`, {
      userId: userId, // Pass user ID
      orderHistory: orderItems // Pass processed order items
    });

    const personalizedRecommendations = pythonResponse.data.recommendations; // Assuming Python returns { recommendations: [...] }

    console.log('Received personalized recommendations from Python:', personalizedRecommendations.length);
    res.json({ recommendations: personalizedRecommendations });

  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    // Return a default list on error as a fallback
    const recommendations = await Product.find()
      .sort({ rating: -1 })
      .limit(8) // Limit the default list
      .select('name description price rating image category');
    
    console.log('Returning default recommendations due to error:', recommendations.length);
    res.status(500).json({
      error: 'Failed to fetch personalized recommendations. Serving default instead.',
      details: error.message,
      recommendations: recommendations // Include default recommendations in the error response
    });
  }
});

// Get AI recommendations (using POST for personalized recommendations)
router.post('/get-personalized-recommendations', async (req, res) => {
  console.log('Personalized Recommendations route handler hit!');
  try {
    // Assuming user information is available in req.user from authentication middleware
    const userId = req.user?._id; 

    if (!userId) {
      console.log('User not authenticated for personalized recommendations');
      // For now, return a default list if user is not logged in or user info is missing
      // In a production app, you might handle this differently (e.g., require login or return popular items)
      const recommendations = await Product.find()
        .sort({ rating: -1 })
        .limit(8)
        .select('name description price rating image category price');

      const formattedRecommendations = recommendations.map(product => ({
          ...product.toJSON(), // Use toJSON() to get a plain JavaScript object
          // Assume original currency is USD and send it as is
          price: product.price || 0,
          currency: 'USD', // Indicate original currency is USD
          _id: product._id.toString(), // Ensure _id is a string
      }));

      console.log('Number of default recommendations found:', formattedRecommendations.length);
      console.log('Returning default recommendations (user not logged in) from POST route in original USD', formattedRecommendations.length);
      return res.json({ recommendations: formattedRecommendations });
    }

    console.log(`Fetching personalized recommendations for user: ${userId}`);

    // Fetch recent orders for the user
    const userOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(10); // Get last 10 orders

    // Extract relevant info from orders (e.g., product IDs, categories). Adjust based on what your Python model expects.
    const orderItems = userOrders.reduce((items, order) => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        return items.concat(order.orderItems.map(item => ({
          product: item.product, // Assuming item.product is the product ID (ObjectId)
          category: item.category,
          // Add other relevant fields from order item
        })));
      }
      return items;
    }, []);

    console.log(`Found ${userOrders.length} recent orders with ${orderItems.length} items for user ${userId}`);

    // Call Python backend for personalized recommendations
    // Ensure your Python Flask app is running and accessible at http://localhost:5001 (or wherever it runs)
    const pythonBackendUrl = process.env.PYTHON_BACKEND_URL || 'http://localhost:5001';

    console.log(`Calling Python backend at ${pythonBackendUrl}/get-personalized-recommendations`);
    const pythonResponse = await axios.post(`${pythonBackendUrl}/get-personalized-recommendations`, {
      userId: userId, // Pass user ID
      orderHistory: orderItems // Pass processed order items
    });

    const personalizedRecommendations = pythonResponse.data.recommendations; // Assuming Python returns { recommendations: [...] }

    console.log('Received personalized recommendations from Python:', personalizedRecommendations.length);
    res.json({ recommendations: personalizedRecommendations });

  } catch (error) {
    console.error('Error fetching personalized recommendations from POST route:', error);
    // Return a default list on error as a fallback
    const recommendations = await Product.find()
      .sort({ rating: -1 })
      .limit(8) // Limit the default list
      .select('name description price rating image category');
    
    console.log('Returning default recommendations due to error from POST route:', recommendations.length);
    res.status(500).json({
      error: 'Failed to fetch personalized recommendations. Serving default instead.',
      details: error.message,
      recommendations: recommendations // Include default recommendations in the error response
    });
  }
});

// Get AI analytics
router.get('/analytics', async (req, res) => {
  console.log('Analytics route handler hit!');
  try {
    const { timeRange } = req.query;
    console.log('Fetching analytics for timeRange:', timeRange);

    // Calculate date range based on timeRange
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
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    // Get total sales
    const orders = await Order.find({
      createdAt: { $gte: startDate }
    }).populate('user', 'name email');

    const totalSales = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get customer growth
    const uniqueCustomers = new Set(orders.map(order => order.user?._id?.toString())).size;
    const previousPeriodOrders = await Order.find({
      createdAt: { 
        $gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
        $lt: startDate
      }
    }).populate('user', 'name email');

    const previousUniqueCustomers = new Set(previousPeriodOrders.map(order => order.user?._id?.toString())).size;
    
    const customerGrowth = previousUniqueCustomers === 0 ? 100 : 
      ((uniqueCustomers - previousUniqueCustomers) / previousUniqueCustomers) * 100;

    // Get sales by category
    const salesByCategory = {};
    orders.forEach(order => {
      if (order.orderItems && Array.isArray(order.orderItems)) {
        order.orderItems.forEach(item => {
          if (item.category) {
            if (!salesByCategory[item.category]) {
              salesByCategory[item.category] = 0;
            }
            salesByCategory[item.category] += (item.price || 0) * (item.qty || 0);
          }
        });
      }
    });

    // Calculate sales trend
    const currentPeriodSales = totalSales;
    const previousPeriodSales = previousPeriodOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const salesTrend = previousPeriodSales === 0 ? 100 :
      ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;

    // Generate sales forecast
    const dailySales = orders.reduce((acc, order) => {
      if (order.createdAt) {
        const date = order.createdAt.toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + (order.totalPrice || 0);
      }
      return acc;
    }, {});

    const averageDailySales = Object.values(dailySales).reduce((sum, sales) => sum + sales, 0) / 
      (Object.keys(dailySales).length || 1);

    const salesForecast = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      return {
        date: date.toISOString().split('T')[0],
        sales: averageDailySales * (1 + (Math.random() * 0.2 - 0.1)) // Add some randomness
      };
    });

    const analytics = {
      totalSales,
      customerGrowth,
      salesTrend,
      salesByCategory,
      salesData: salesForecast
    };

    console.log('Analytics data:', analytics);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message
    });
  }
});

// Chatbot endpoint
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received chat message:', message);
    
    if (!message) {
      console.log('No message provided');
      return res.status(400).json({ error: 'Message is required' });
    }

    // For testing, return a simple response
    const response = {
      response: `I received your message: "${message}". This is a test response.`
    };
    
    console.log('Sending chat response:', response);
    res.json(response);
  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({
      error: 'Failed to get chatbot response',
      details: error.message
    });
  }
});

export default router; 