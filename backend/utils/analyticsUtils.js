// Calculate moving average for time series data
export const calculateMovingAverage = (dailySales, windowSize = 7) => {
  const dates = Object.keys(dailySales).sort();
  const movingAverages = {};

  for (let i = windowSize - 1; i < dates.length; i++) {
    const windowDates = dates.slice(i - windowSize + 1, i + 1);
    const windowSum = windowDates.reduce((sum, date) => sum + dailySales[date], 0);
    movingAverages[dates[i]] = windowSum / windowSize;
  }

  return movingAverages;
};

// Calculate seasonality patterns
export const calculateSeasonality = (dailySales) => {
  const dates = Object.keys(dailySales).sort();
  const seasonality = {
    weekly: {},
    monthly: {}
  };

  // Weekly seasonality
  dates.forEach(date => {
    const dayOfWeek = new Date(date).getDay();
    if (!seasonality.weekly[dayOfWeek]) {
      seasonality.weekly[dayOfWeek] = {
        total: 0,
        count: 0
      };
    }
    seasonality.weekly[dayOfWeek].total += dailySales[date];
    seasonality.weekly[dayOfWeek].count++;
  });

  // Calculate averages
  Object.keys(seasonality.weekly).forEach(day => {
    seasonality.weekly[day] = seasonality.weekly[day].total / seasonality.weekly[day].count;
  });

  // Monthly seasonality
  dates.forEach(date => {
    const month = new Date(date).getMonth();
    if (!seasonality.monthly[month]) {
      seasonality.monthly[month] = {
        total: 0,
        count: 0
      };
    }
    seasonality.monthly[month].total += dailySales[date];
    seasonality.monthly[month].count++;
  });

  // Calculate averages
  Object.keys(seasonality.monthly).forEach(month => {
    seasonality.monthly[month] = seasonality.monthly[month].total / seasonality.monthly[month].count;
  });

  return seasonality;
};

// Predict next month's sales using multiple factors
export const predictNextMonthSales = (orders) => {
  // Group orders by date
  const dailySales = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + order.totalPrice;
    return acc;
  }, {});

  // Calculate basic metrics
  const dates = Object.keys(dailySales).sort();
  const sales = dates.map(date => dailySales[date]);
  
  // Calculate trend
  const n = sales.length;
  const xMean = (n - 1) / 2;
  const yMean = sales.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    numerator += (i - xMean) * (sales[i] - yMean);
    denominator += Math.pow(i - xMean, 2);
  }
  
  const slope = numerator / denominator;
  const intercept = yMean - slope * xMean;

  // Calculate seasonality
  const seasonality = calculateSeasonality(dailySales);
  
  // Generate predictions for next 30 days
  const predictions = [];
  const lastDate = new Date(dates[dates.length - 1]);
  
  for (let i = 1; i <= 30; i++) {
    const predictionDate = new Date(lastDate);
    predictionDate.setDate(lastDate.getDate() + i);
    
    const dayOfWeek = predictionDate.getDay();
    const month = predictionDate.getMonth();
    
    // Base prediction using trend
    const trendPrediction = slope * (n + i) + intercept;
    
    // Apply seasonality factors
    const weeklyFactor = seasonality.weekly[dayOfWeek] || 1;
    const monthlyFactor = seasonality.monthly[month] || 1;
    
    // Calculate final prediction
    const prediction = trendPrediction * weeklyFactor * monthlyFactor;
    
    predictions.push({
      date: predictionDate.toISOString().split('T')[0],
      predictedSales: Math.max(0, prediction),
      confidence: calculatePredictionConfidence(i, n)
    });
  }

  return predictions;
};

// Calculate confidence score for predictions
const calculatePredictionConfidence = (daysAhead, historicalDataPoints) => {
  // Confidence decreases as we predict further into the future
  const timeDecay = Math.max(0, 1 - (daysAhead / 30));
  
  // Confidence increases with more historical data
  const dataConfidence = Math.min(1, historicalDataPoints / 90);
  
  return Math.round((timeDecay * 0.7 + dataConfidence * 0.3) * 100);
};

// Calculate correlation between two arrays
export const calculateCorrelation = (x, y) => {
  const n = x.length;
  let sum_x = 0;
  let sum_y = 0;
  let sum_xy = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;

  for (let i = 0; i < n; i++) {
    sum_x += x[i];
    sum_y += y[i];
    sum_xy += x[i] * y[i];
    sum_x2 += x[i] * x[i];
    sum_y2 += y[i] * y[i];
  }

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  return denominator === 0 ? 0 : numerator / denominator;
};

// Calculate growth rate
export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Calculate compound annual growth rate (CAGR)
export const calculateCAGR = (beginningValue, endingValue, years) => {
  if (years <= 0 || beginningValue <= 0) return 0;
  return (Math.pow(endingValue / beginningValue, 1 / years) - 1) * 100;
}; 