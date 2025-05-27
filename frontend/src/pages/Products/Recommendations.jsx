import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

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
          recommended.map((product) => (
            <Link to={`/product/${product._id}`} key={product._id}>
              <div className="border rounded-lg shadow-md p-4 hover:shadow-lg transition duration-200">
              <img
  src={
    product.image
      ? product.image.startsWith("http")
        ? product.image
        : `http://localhost:5000${product.image}`
      : "https://via.placeholder.com/150" // default image
  }
  alt={product.name || "Product"}
  className="w-full h-48 object-cover rounded-md"
/>
                <h3 className="text-lg font-semibold mt-2">{product.name}</h3>
                <p className="text-gray-600">${product.price}</p>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-4">No recommendations found.</p>
        )}
      </div>
    </div>
  );
};

export default Recommendations;
