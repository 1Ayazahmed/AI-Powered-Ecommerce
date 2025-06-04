import { Link } from "react-router-dom";
import HeartIcon from "./HeartIcon";
import { useSelector } from 'react-redux';

const Product = ({ product }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency);

  const convertPrice = (priceInUSD) => {
    if (currentCurrency === "USD" || !exchangeRates || !exchangeRates.USD) {
      return `$${priceInUSD?.toFixed(2)}`;
    } else {
      const pkrToUsdRate = exchangeRates.USD;
      if (pkrToUsdRate === 0) {
        console.error("PKR to USD exchange rate is 0, cannot convert.");
        return `$${priceInUSD?.toFixed(2)}`;
      }
      const usdToPkrRate = 1 / pkrToUsdRate;
      const priceInPKR = priceInUSD * usdToPkrRate;

      if (currentCurrency === "PKR") {
        return `PKR ${priceInPKR?.toFixed(2)}`;
      } else if (exchangeRates[currentCurrency]) {
        const pkrToTargetRate = exchangeRates[currentCurrency];
        const convertedPrice = priceInPKR * pkrToTargetRate;
        return `${currentCurrency} ${convertedPrice.toFixed(2)}`;
      } else {
        console.warn(`Exchange rate for ${currentCurrency} not available.`);
        return `$${priceInUSD?.toFixed(2)}`;
      }
    }
  };

  return (
    <div className="p-3 relative">
      <div className="relative">
        <img
          src={`${backendUrl}${product.image}`}
          alt={product.name}
          className="w-full h-48 object-cover rounded"
          onError={(e) => {
            console.error('Image failed to load:', `${backendUrl}${product.image}`);
            const filename = product.image.split('/').pop();
            e.target.src = `${backendUrl}/test-image/${filename}`;
            
            e.target.onerror = () => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2NjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
            };
          }}
        />
        <HeartIcon product={product} />
      </div>

      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h2 className="flex justify-between items-center">
            <div className="text-lg">{product.name}</div>
            <span className="bg-pink-100 text-pink-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-pink-900 dark:text-pink-300">
              {convertPrice(product.price)}
            </span>
          </h2>
        </Link>
      </div>
    </div>
  );
};

export default Product;
