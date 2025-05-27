import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetProductsQuery } from "../redux/api/productApiSlice";
import Loader from "../components/Loader";
import Message from "../components/Message";
import Header from "../components/Header";
import Product from "./Products/Product";
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/slices/aiSlice';
import InfiniteScroll from 'react-infinite-scroll-component';

// import AIRecommendations from "../components/AIRecommendations";
import Recommendations from "./Products/Recommendations";

const Home = () => {
  const { keyword } = useParams();
  const dispatch = useDispatch();

  // Use AI recommendations state from Redux
  const { recommendations, loading, error } = useSelector((state) => state.ai);

  // Local state for infinite scrolling
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allRecommendations, setAllRecommendations] = useState([]);

  useEffect(() => {
    // Fetch initial recommendations when component mounts
    dispatch(fetchRecommendations());
  }, [dispatch]);

  useEffect(() => {
    // Append new recommendations for infinite scrolling
    if (recommendations && recommendations.length > 0) {
        // Simple append for demonstration; real infinite scroll would handle pagination
        setAllRecommendations(prev => [...prev, ...recommendations]);
        // For this example, we'll just load once. In a real scenario, you'd check if more data is available.
        setHasMore(false); 
    }
  }, [recommendations]);

  // Placeholder for fetching more data (for true infinite scrolling)
  const fetchMoreData = () => {
    // In a real application, you would dispatch fetchRecommendations with pagination parameters (e.g., page + 1)
    // For this example, we'll stop after the initial load.
    // dispatch(fetchRecommendations(page + 1));
    // setPage(prev => prev + 1);
  };

  return (
    <>
      {!keyword ? <Header /> : null}
      {
        loading.recommendations ? (
          <Loader />
        ) : error.recommendations ? (
          <Message variant="danger">{error.recommendations.details || error.recommendations}</Message>
        ) : (
          <div>
            <h1 className="text-2xl font-bold mb-6">AI Recommended Products</h1>
            <InfiniteScroll
              dataLength={allRecommendations.length} // This is important field to render the next data
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<Loader />} // Show loader at the bottom
              endMessage={!hasMore && allRecommendations.length > 0 ? <p style={{ textAlign: 'center' }}><b>You have seen all recommendations</b></p> : null}
              // Add a scrollableTarget if you have a specific container
            >
              <div className="flex flex-wrap justify-center">
                {allRecommendations.map((product) => (
                  <Product key={product._id} product={product} />
                ))}
              </div>
            </InfiniteScroll>
             {allRecommendations.length === 0 && !loading.recommendations && !error.recommendations && (
                <p style={{ textAlign: 'center' }}>No recommendations available.</p>
            )}
          </div>
        )
      }
    </>
  );
};

export default Home;
