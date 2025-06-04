import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/features/cart/cartSlice";
import { toast } from "react-toastify";
import HeartIcon from "./HeartIcon";
import { FaTruck } from "react-icons/fa";

const ProductCard = ({ p }) => {
  const dispatch = useDispatch();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  console.log('ProductCard - VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
  console.log('ProductCard - backendUrl:', backendUrl);

  // Access currency state from Redux
  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency);

  // Helper function to convert price
  const convertPrice = (priceInPKR) => {
    if (currentCurrency === "PKR" || !exchangeRates || !exchangeRates[currentCurrency]) {
      return `PKR ${priceInPKR?.toFixed(2)}`;
    } else {
      const rate = exchangeRates[currentCurrency];
      const convertedPrice = priceInPKR * rate;
      return `${currentCurrency} ${convertedPrice.toFixed(2)}`;
    }
  };

  // Add debug logging
  console.log('ProductCard rendering:', {
    productId: p._id,
    productName: p.name,
    imagePath: p.image,
    fullImageUrl: p.image.startsWith('http') ? p.image : `${backendUrl}${p.image}`,
    discountPercentage: p.discountPercentage,
    isFreeDelivery: p.isFreeDelivery,
    discountedPrice: p.discountedPrice,
    currentCurrency,
    exchangeRates,
  });

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
    toast.success("Item added successfully", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 2000,
    });
  };

  return (
    <div className="max-w-sm relative bg-[#1A1A1A] rounded-lg shaodw dark:bg-gray-800 dark:border-gray-700">
      <section className="relative">
        <Link to={`/product/${p._id}`}>
          <span className="absolute bottom-3 right-3 bg-pink-100 text-pink-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
            {p?.brand}
          </span>
          {p.discountPercentage > 0 && (
             <span className="absolute top-3 left-3 bg-green-500 text-white text-sm font-bold px-2.5 py-0.5 rounded-full">
                {p.discountPercentage}% OFF
             </span>
          )}
          <img
            className="cursor-pointer w-full"
            src={p.image.startsWith('http') ? p.image : `${backendUrl}${p.image}`}
            alt={p.name}
            style={{ height: "170px", objectFit: "cover" }}
            onError={(e) => {
              console.error('Image failed to load:', {
                attemptedUrl: p.image.startsWith('http') ? p.image : `${backendUrl}${p.image}`,
                productId: p._id,
                productName: p.name
              });
              // Try to load the image directly through the test route
              const filename = p.image.split('/').pop();
              const testUrl = `${backendUrl}/test-image/${filename}`;
              console.log('Trying test route:', testUrl);
              e.target.src = testUrl;
              
              // If that fails too, show a data URL for a simple placeholder
              e.target.onerror = () => {
                console.log('Test route failed, using placeholder');
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
              };
            }}
          />
        </Link>
        <HeartIcon product={p} />
      </section>

      <div className="p-5">
        <div className="flex justify-between items-center">
          <h5 className="mb-2 text-xl text-white dark:text-white">{p?.name}</h5>

          <div>
             {p.discountPercentage > 0 ? (
               <div className="flex flex-col items-end">
                 <p className="text-gray-500 line-through text-sm">
                   {convertPrice(p?.price)}
                 </p>
                 <p className="text-pink-500 font-semibold text-lg">
                   {convertPrice(p?.discountedPrice)}
                 </p>
               </div>
             ) : (
               <p className="text-pink-500 font-semibold text-lg">
                 {convertPrice(p?.price)}
               </p>
             )}

             {p.isFreeDelivery && (
                <FaTruck className="text-green-500 mt-1" size={20} />
             )}
          </div>

        </div>

        <p className="mb-3 font-normal text-[#CFCFCF]">
          {p?.description?.substring(0, 60)} ...
        </p>

        <section className="flex justify-between items-center">
          <Link
            to={`/product/${p._id}`}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
          >
            Read More
            <svg
              className="w-3.5 h-3.5 ml-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>

          <button
            className="p-2 rounded-full"
            onClick={() => addToCartHandler(p, 1)}
          >
            <AiOutlineShoppingCart size={25} />
          </button>
        </section>
      </div>
    </div>
  );
};

export default ProductCard;
