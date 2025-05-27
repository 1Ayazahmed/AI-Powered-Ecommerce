import React from 'react';
import Recommendations from '../../components/AI/Recommendations';
import PredictiveAnalytics from '../../components/AI/PredictiveAnalytics';

const AIFeatures = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">AI-Powered Features</h1>
        <PredictiveAnalytics />
        <div className="mt-12">
          <Recommendations />
        </div>
      </div>
    </div>
  );
};

export default AIFeatures; 