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

  // Get user info from Redux state
  const { userInfo } = useSelector((state) => state.auth);

  // Use AI recommendations state from Redux
  const { recommendations, loading, error } = useSelector((state) => state.ai);

  // Local state for infinite scrolling
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allRecommendations, setAllRecommendations] = useState([]);

  useEffect(() => {
    // Fetch initial recommendations when component mounts
    // Pass userId to fetch personalized recommendations if user is logged in
    dispatch(fetchRecommendations({ userId: userInfo?._id }));
  }, [dispatch, userInfo?._id]); // Add userInfo?._id as a dependency

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
          <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">AI Recommended Products</h1>
            <InfiniteScroll
              dataLength={allRecommendations.length}
              next={fetchMoreData}
              hasMore={hasMore}
              loader={<Loader />}
              endMessage={!hasMore && allRecommendations.length > 0 ? <p style={{ textAlign: 'center' }}><b>You have seen all recommendations</b></p> : null}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allRecommendations.map((product) => (
                  <div key={product._id}>
                    <Product product={product} />
                  </div>
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
