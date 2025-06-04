import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

const Recommendations = ({ productId }) => {
  const [recommended, setRecommended] = useState([]);
  console.log("Sending productId to AI:", productId);
  

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const { data } = await axios.post("http://localhost:5000/api/recommend", {
          productId,
        });
  
        console.log("👉 AI Returned Products:", data); // ADD THIS LINE
        setRecommended(data);
      } catch (err) {
        console.error("🚫 Error fetching recommendations:", err);
      }
    };
  
    if (productId) fetchRecommendations();
  }, [productId]);
  
  

  return (
    <div className="mt-12 px-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-pink-600">
        AI-Powered Recommended Products
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {recommended.length > 0 ? (
          recommended.map((product) => {
            console.log('Rendering recommended product with ID:', product._id);
            return (
              <ProductCard key={product._id} p={product} />
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-4">No recommendations found.</p>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
