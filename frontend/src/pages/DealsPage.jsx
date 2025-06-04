import React, { useEffect } from 'react';
import { useGetDiscountedProductsQuery } from '../redux/api/productApiSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProductCard from './Products/ProductCard'; // Assuming ProductCard can be reused

const DealsPage = () => {
  const { data: discountedProducts, isLoading, error } = useGetDiscountedProductsQuery();

  useEffect(() => {
    // Optional: Log data when fetched for debugging
    if (discountedProducts) {
      console.log('Fetched Discounted Products:', discountedProducts);
    }
  }, [discountedProducts]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return <Message variant="danger">Failed to load discounted products.</Message>;
  }

  // Check if discountedProducts is an array and not empty
  if (!discountedProducts || !Array.isArray(discountedProducts) || discountedProducts.length === 0) {
    return <Message>No deals available at the moment.</Message>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Deals of the Day</h2>
      <div className="flex flex-wrap justify-center -mx-2">
        {discountedProducts.map((product) => (
          <div className="p-2 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5" key={product._id}>
            <ProductCard p={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DealsPage; 