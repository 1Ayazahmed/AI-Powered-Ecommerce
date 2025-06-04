import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaStar, FaShoppingCart } from 'react-icons/fa';
import { useSelector } from 'react-redux';

// Accept productId as a prop
const Recommendations = ({ productId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user info from Redux state
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch recommendations only if productId is available
    if (productId) {
        fetchRecommendations();
    }
  }, [userInfo, productId]); // Add productId as a dependency

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      const requestPayload = {
          productId: productId // Include the productId in the request
      };

      if (userInfo && userInfo._id) {
        requestPayload.userId = userInfo._id; // Include the logged-in user's ID
      }

      // Fetch recommendations from the AI recommendation service
      const response = await axios.post('http://localhost:5001/recommend', requestPayload); 

      // The backend /recommend endpoint returns a list directly
      setRecommendations(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to load recommendations');
      setLoading(false);
    }
  };

  if (loading && productId) { // Only show loading if productId is available
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && productId) { // Only show error if productId is available
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  // Don't render if no recommendations and not loading/error (e.g., productId not yet loaded)
  if (!recommendations || recommendations.length === 0) {
      return null; // Or render a placeholder if you prefer
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={i < product.rating ? 'text-yellow-400' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">({product.reviews})</span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">${product.price}</span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors">
                  <FaShoppingCart className="mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recommendations; 