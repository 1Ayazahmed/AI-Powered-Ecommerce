import React, { useEffect } from 'react';
import { Card, Row, Col, Button, Rate, Spin, Alert, Carousel } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/slices/aiSlice';
import { useGetNewProductsQuery } from '../redux/api/productApiSlice';
import { Link } from 'react-router-dom';
import ProductCard from '../Products/ProductCard';

const { Meta } = Card;

const Home = () => {
  const dispatch = useDispatch();
  const { recommendations, loading, error } = useSelector((state) => state.ai);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: newProducts, isLoading: loadingNewProducts, error: errorNewProducts } = useGetNewProductsQuery();

  useEffect(() => {
    if (userInfo) {
      dispatch(fetchRecommendations({ userId: userInfo._id }));
    } else {
      dispatch(fetchRecommendations({}));
    }
  }, [dispatch, userInfo]);

  if (loading.recommendations || loadingNewProducts) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error.recommendations || errorNewProducts) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description="Failed to load data. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  const carouselContent = newProducts?.map((product) => (
    <div key={product._id} className="p-4">
      <Link to={`/product/${product._id}`}>
        <Card
          hoverable
          cover={
            <img
              alt={product.name}
              src={product.image}
              style={{ height: 300, objectFit: 'cover' }}
            />
          }
        >
          <Meta
            title={product.name}
            description={
              <div className="text-gray-600">
                <p>{product.description.substring(0, 100)}...</p>
                <div className="flex justify-between items-center mt-2">
                  <Rate disabled defaultValue={product.rating} />
                  <span className="text-lg font-bold text-white">${product.price}</span>
                </div>
              </div>
            }
          />
        </Card>
      </Link>
    </div>
  ));

  return (
    <div className="p-6 bg-[#101011] text-white min-h-screen">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 text-center">New Arrivals</h2>
        {newProducts && newProducts.length > 0 ? (
          <Carousel autoplay>
            {carouselContent}
          </Carousel>
        ) : (
          <p className="text-center">No new products available.</p>
        )}
      </div>

      <div className="w-full mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center w-full">Recommended for You</h1>
        
        <Row gutter={[16, 16]}>
          {recommendations?.map((product) => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <ProductCard p={product} />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home; 