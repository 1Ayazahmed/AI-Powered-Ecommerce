import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const AIRecommendations = () => {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await axios.post("/api/recommend", {
        page,
        limit: 8 // Load 8 at a time
      });

      if (res.data.length > 0) {
        setProducts((prev) => [...prev, ...res.data]);
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching AI recommendations:", err.message);
      setHasMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (!hasMore || !loaderRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchRecommendations();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [fetchRecommendations, hasMore]);

  return (
    <div className="p-4 items-center justify-center">
      <h2 className="text-2xl font-bold mb-4">🧠 AI Powered Recommended Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white shadow-md p-4 rounded-lg hover:shadow-lg transition"
          >
            <h3 className="text-lg font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-600">{product.description}</p>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={loaderRef} className="text-center py-4 text-gray-500">
          Loading more...
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
