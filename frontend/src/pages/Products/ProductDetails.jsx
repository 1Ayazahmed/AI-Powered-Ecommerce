import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from "../../redux/api/productApiSlice";
import Loader from "../../components/Loader";
import Message from "../../components/Message";
import {
  FaBox,
  FaClock,
  FaShoppingCart,
  FaStar,
  FaStore,
} from "react-icons/fa";
import moment from "moment";
import HeartIcon from "./HeartIcon";
import Ratings from "./Ratings";
import ProductTabs from "./ProductTabs";
import { addToCart } from "../../redux/features/cart/cartSlice";
import Recommendations from './Recommendations';
import ProductDescriptionGenerator from '../../components/AI/ProductDescriptionGenerator';
import axios from 'axios'; // Import axios for the feedback API call

const ProductDetails = () => {
  const { id: productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // New state for feedback form
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(productId);

  const { userInfo } = useSelector((state) => state.auth);
  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency); // Access currency state

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  console.log('Backend URL:', backendUrl);
  console.log('Product image path:', product?.image);

  // Helper function to convert price from USD to the target currency
  const convertPrice = (priceInUSD) => {
    console.log('Converting price:', priceInUSD, 'USD to', currentCurrency);
    console.log('Available exchange rates:', exchangeRates);
    console.log('USD to PKR rate (from API, means 1 PKR to USD):', exchangeRates?.USD);

    if (currentCurrency === "USD" || !exchangeRates || !exchangeRates.USD) {
      // If target is USD, or exchange rates are not available for USD (needed for inverse conversion)
      return `$${priceInUSD?.toFixed(2)}`;
    } else {
      // Convert USD to PKR using the inverse of the USD rate relative to PKR
      const pkrToUsdRate = exchangeRates.USD; // Rate for 1 PKR in USD
      if (pkrToUsdRate === 0) {
          console.error("PKR to USD exchange rate is 0, cannot convert.");
          return `$${priceInUSD?.toFixed(2)}`; // Fallback to USD
      }
      const usdToPkrRate = 1 / pkrToUsdRate; // Rate for 1 USD in PKR
      console.log('Calculated USD to PKR conversion rate:', usdToPkrRate);
      const priceInPKR = priceInUSD * usdToPkrRate;

      if (currentCurrency === "PKR") {
        return `PKR ${priceInPKR?.toFixed(2)}`;
      } else if (exchangeRates[currentCurrency]) {
        // Then convert from PKR to the target currency using the target currency rate relative to PKR
        const pkrToTargetRate = exchangeRates[currentCurrency]; // Rate for 1 PKR in target currency
        const convertedPrice = priceInPKR * pkrToTargetRate;
        return `${currentCurrency} ${convertedPrice.toFixed(2)}`;
      } else {
        // Fallback to displaying in USD if target currency rate is not available
        console.warn(`Exchange rate for ${currentCurrency} not available.`);
        return `$${priceInUSD?.toFixed(2)}`;
      }
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productId,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success("Review created successfully");
    } catch (error) {
      toast.error(error?.data || error.message);
    }
  };

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    navigate("/cart");
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      await axios.post(`${backendUrl}/api/products/${productId}/feedback`, {
        rating: feedbackRating,
        comment: feedbackComment,
      }, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
      });
      toast.success("Feedback submitted successfully");
      setFeedbackRating(0);
      setFeedbackComment("");
    } catch (error) {
      toast.error(error?.data || error.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  return (
    <>
      <div>
        <Link
          to="/"
          className="text-white font-semibold hover:underline ml-4 md:ml-10"
        >
          Go Back
        </Link>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.message}
        </Message>
      ) : (
        <>
          <div className="container mx-auto p-4 md:p-6">
            {/* Product Image and Details Area */}
            <div className="flex flex-col md:flex-row items-start md:items-stretch mt-4 md:mt-[2rem] gap-8">
              {/* Product Image */}
              <div className="w-full md:w-1/2 lg:w-2/5">
              <img
                  src={product.image.startsWith('http') ? product.image : `${backendUrl}${product.image}`}
                alt={product.name}
                  className="w-full h-auto object-cover rounded"
                  onError={(e) => {
                    console.error('Image failed to load:', {
                      attemptedUrl: product.image.startsWith('http') ? product.image : `${backendUrl}${product.image}`,
                      productId: product._id,
                      productName: product.name
                    });
                    // Try to load the image directly through the test route
                    const filename = product.image.split('/').pop();
                    const testUrl = `${backendUrl}/test-image/${filename}`;
                    console.log('Trying test route:', testUrl);
                    e.target.src = testUrl;
                    
                    // If that fails too, show a data URL for a simple placeholder
                    e.target.onerror = () => {
                      console.log('Test route failed, using placeholder');
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Z3M=';
                    };
                  }}
              />

                <HeartIcon product={product} className="absolute top-4 right-4" />
            </div>

              {/* Product Details */}
              <div className="w-full md:w-1/2 lg:w-3/5 flex flex-col justify-between">
                <h2 className="text-xl md:text-2xl font-semibold">{product.name}</h2>
                <p className="my-4 text-[#B0B0B0]">
                {product.description}
              </p>

              {/* Add AI Description Generator for admin users */}
              {userInfo?.isAdmin && (
                  <div className="mt-4 md:mt-8">
                  <ProductDescriptionGenerator 
                    product={product}
                    onDescriptionUpdate={(newDescription) => {
                      refetch(); // Refresh product data after update
                    }}
                  />
                </div>
              )}

              {/* Display Price and Discount Information */}
              <div className="my-4">
                {product.discountPercentage > 0 ? (
                  <>
                      <p className="text-lg md:text-xl font-bold text-gray-500 line-through"> {/* Original Price */}
                      {convertPrice(product.price)}
                    </p>
                      <p className="text-3xl md:text-5xl font-extrabold text-green-500"> {/* Discounted Price */}
                      {convertPrice(product.discountedPrice)}
                    </p>
                    <span className="text-sm text-green-400">{product.discountPercentage}% Off</span> {/* Discount Percentage */}
                  </>
                ) : (
                    <p className="text-3xl md:text-5xl font-extrabold">{convertPrice(product.price)}</p> /* Original Price (no discount) */
                )}
              </div>

              {/* Free Delivery Indicator */}
              {product.isFreeDelivery && (
                <p className="text-green-500 font-bold mt-2">🚚 Free Delivery</p>
              )}

                {/* Product Info Grid/Flex */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 my-4">
                  <div>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                    <FaStore className="mr-2 text-white" /> Brand:{" "}
                    {product.brand}
                  </h1>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                    <FaClock className="mr-2 text-white" /> Added:{" "}
                    {moment(product.createAt).fromNow()}
                  </h1>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                    <FaStar className="mr-2 text-white" /> Reviews:{" "}
                    {product.numReviews}
                  </h1>
                </div>

                  <div>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                      <FaStar className="mr-2 text-white" /> Ratings: {product.rating.toFixed(1)} {/* Display average rating */}
                  </h1>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                    <FaShoppingCart className="mr-2 text-white" /> Quantity:{" "}
                    {product.countInStock}
                  </h1>
                    <h1 className="flex items-center mb-2 text-sm md:text-base">
                      <FaBox className="mr-2 text-white" /> In Stock:{" "}
                      {product.countInStock > 0 ? "In Stock" : "Out of Stock"}
                  </h1>
                </div>
              </div>

                {/* Quantity Selector and Add to Cart Button */}
                <div className="flex items-center mt-4">
                {product.countInStock > 0 && (
                    <select
                      className="w-24 p-2 border rounded-lg text-black mr-4"
                      value={qty}
                      onChange={(e) => setQty(Number(e.target.value))}
                    >
                      {[...Array(product.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  )}

                  <button
                    onClick={addToCartHandler}
                    disabled={product.countInStock === 0}
                    className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add To Cart
                  </button>
                </div>
              </div>
            </div>

            {/* Feedback and Review Sections */}
            <div className="flex flex-col md:flex-row gap-8 mt-8">
              {/* Leave Feedback Form */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold mb-2">Leave Feedback</h3>
                {userInfo ? (
                  <form onSubmit={handleFeedbackSubmit}>
                    <div className="mb-4">
                      <label htmlFor="feedbackRating" className="block mb-2 text-sm font-medium text-white">Rating:</label>
                      <select
                        id="feedbackRating"
                        className="w-full p-2 border rounded-lg bg-[#101011] text-white"
                        value={feedbackRating}
                        onChange={(e) => setFeedbackRating(Number(e.target.value))}
                        required
                      >
                        <option value="0">Select Rating</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="feedbackComment" className="block mb-2 text-sm font-medium text-white">Comment:</label>
                      <textarea
                        id="feedbackComment"
                        rows="4"
                        className="w-full p-2 border rounded-lg bg-[#101011] text-white"
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        required
                      ></textarea>
                  </div>
                    <button
                      type="submit"
                      className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                      disabled={submittingFeedback}
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </form>
                ) : (
                  <p>Please <Link to="/login">sign in</Link> to leave feedback.</p>
                )}
              </div>

              {/* Write Your Review Form */}
              <div className="w-full md:w-1/2">
                 <h3 className="text-lg font-semibold mb-2">Write Your Review</h3>
                {userInfo ? (
                  <form onSubmit={submitHandler}>
                    <div className="mb-4">
                      <label htmlFor="rating" className="block mb-2 text-sm font-medium text-white">Rating:</label>
                      <select
                        id="rating"
                        className="w-full p-2 border rounded-lg bg-[#101011] text-white"
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        required
                      >
                        <option value="0">Select</option>
                        <option value="1">1 - Poor</option>
                        <option value="2">2 - Fair</option>
                        <option value="3">3 - Good</option>
                        <option value="4">4 - Very Good</option>
                        <option value="5">5 - Excellent</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label htmlFor="comment" className="block mb-2 text-sm font-medium text-white">Comment:</label>
                      <textarea
                        id="comment"
                        rows="4"
                        className="w-full p-2 border rounded-lg bg-[#101011] text-white"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                <button
                      type="submit"
                      className="bg-pink-600 text-white py-2 px-4 rounded-lg hover:bg-pink-700 disabled:opacity-50"
                      disabled={loadingProductReview}
                    >
                      Submit
                </button>
                  </form>
                ) : (
                  <p>Please <Link to="/login">sign in</Link> to write a review.</p>
                )}
              </div>
            </div>

            {/* All Reviews and Related Products Section */}
            <div className="flex flex-col md:flex-row gap-8 mt-8">
              {/* All Reviews */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold mb-2">All Reviews</h3>
                {product.reviews.length === 0 ? (
                  <Message>No Reviews</Message>
                ) : (
                  <ul>
                    {product.reviews.map((review) => (
                      <li key={review._id} className="border-b border-gray-700 pb-4 mb-4">
                        <div className="flex justify-between">
                          <strong className="text-white">{review.name}</strong>
                          <p className="text-gray-400 text-sm">
                            {review.createdAt.substring(0, 10)}
                          </p>
                        </div>
                        <Ratings value={review.rating} />
                        <p className="my-2 text-[#B0B0B0]">{review.comment}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Related Products (AI Recommended Products) */}
              <div className="w-full md:w-1/2">
                <h3 className="text-lg font-semibold mb-2">Related Products</h3>
                 {/* Assuming Recommendations component handles its own fetching and layout */}
                 {/* Pass the current product ID or category for related recommendations if needed by the component */}
                 <Recommendations currentProductId={productId} />
            </div>
          </div>

          </div>
        </>
      )}
    </>
  );
};

export default ProductDetails;
