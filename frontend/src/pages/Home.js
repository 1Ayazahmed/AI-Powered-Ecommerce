import React, { useEffect } from 'react';
import { Card, Row, Col, Button, Rate, Spin, Alert } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecommendations } from '../redux/slices/aiSlice';
import { addToCart } from '../redux/slices/cartSlice';

const { Meta } = Card;

const Home = () => {
  const dispatch = useDispatch();
  const { recommendations, loading, error } = useSelector((state) => state.ai);

  useEffect(() => {
    dispatch(fetchRecommendations());
  }, [dispatch]);

  const handleAddToCart = (product) => {
    dispatch(addToCart(product));
  };

  if (loading.recommendations) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error.recommendations) {
    return (
      <div className="p-4">
        <Alert
          message="Error"
          description="Failed to load recommendations. Please try again later."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Recommended for You</h1>
      
      <Row gutter={[16, 16]}>
        {recommendations?.map((product) => (
          <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              cover={
                <img
                  alt={product.name}
                  src={product.image}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
              actions={[
                <Button
                  type="primary"
                  onClick={() => handleAddToCart(product)}
                >
                  Add to Cart
                </Button>
              ]}
            >
              <Meta
                title={product.name}
                description={
                  <div>
                    <p className="text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <Rate disabled defaultValue={product.rating} />
                      <span className="text-lg font-bold">${product.price}</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Home; 