import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import { addToCart, removeFromCart } from "../redux/features/cart/cartSlice";

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency);

  // Helper function to convert price from USD to the target currency
  const convertPrice = (priceInUSD) => {
    if (currentCurrency === "USD" || !exchangeRates || !exchangeRates.USD) {
      // If target is USD, or exchange rates are not available for USD
      return `$${priceInUSD?.toFixed(2)}`;
    } else {
      // Convert USD to PKR using the inverse of the USD rate relative to PKR
      const pkrToUsdRate = exchangeRates.USD; // Rate for 1 PKR in USD
      if (pkrToUsdRate === 0) {
          console.error("PKR to USD exchange rate is 0, cannot convert.");
          return `$${priceInUSD?.toFixed(2)}`; // Fallback to USD
      }
      const usdToPkrRate = 1 / pkrToUsdRate; // Rate for 1 USD in PKR
      const priceInPKR = priceInUSD * usdToPkrRate;

      if (currentCurrency === "PKR") {
        return `PKR ${priceInPKR?.toFixed(2)}`;
      } else if (exchangeRates[currentCurrency]) {
        // Then convert from PKR to the target currency
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

  const addToCartHandler = (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate("/login?redirect=/shipping");
  };

  return (
    <>
      <div className="container mx-auto mt-8 p-4 md:p-6 flex flex-col md:flex-row items-start md:justify-around">
        {cartItems.length === 0 ? (
          <div className="text-center w-full">
            Your cart is empty <Link to="/shop" className="text-pink-500">Go To Shop</Link>
          </div>
        ) : (
          <>
            {/* Cart Items List */}
            <div className="flex flex-col w-full md:w-2/3 lg:w-3/4 mb-8 md:mb-0 md:mr-8">
              <h1 className="text-xl md:text-2xl font-semibold mb-4">Shopping Cart</h1>

              {cartItems.map((item) => (
                <div key={item._id} className="flex items-center border-b border-gray-700 mb-4 pb-4 flex-wrap">
                  <div className="w-20 h-20 mr-4 mb-4 sm:mb-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-[150px] mr-4 mb-4 sm:mb-0">
                    <Link to={`/product/${item._id}`} className="text-pink-500 text-lg font-semibold">
                      {item.name}
                    </Link>

                    <div className="mt-1 text-gray-400">{item.brand}</div>
                    <div className="mt-2 text-white font-bold">
                      {convertPrice(item.price)}
                    </div>
                  </div>

                  <div className="w-24 mr-4 mb-4 sm:mb-0">
                    <select
                      className="w-full p-1 border rounded text-black"
                      value={item.qty}
                      onChange={(e) =>
                        addToCartHandler(item, Number(e.target.value))
                      }
                    >
                      {[...Array(item.countInStock).keys()].map((x) => (
                        <option key={x + 1} value={x + 1}>
                          {x + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ml-auto">
                    <button
                      className="text-red-500"
                      onClick={() => removeFromCartHandler(item._id)}
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="mt-8 md:mt-0 w-full md:w-1/3 lg:w-1/4">
              <div className="p-4 rounded-lg bg-[#151515]">
                <h2 className="text-xl font-semibold mb-4 border-b border-gray-700 pb-2">
                  Order Summary
                  </h2>

                <div className="text-white mb-4">
                  Items: ({cartItems.reduce((acc, item) => acc + item.qty, 0)})
                </div>

                <div className="text-2xl font-bold mb-4">
                  Total: 
                    {
                      convertPrice(
                        cartItems.reduce((acc, item) => acc + item.qty * item.price, 0)
                      )
                    }
                  </div>

                  <button
                    className="bg-pink-500 mt-4 py-2 px-4 rounded-full text-lg w-full"
                    disabled={cartItems.length === 0}
                    onClick={checkoutHandler}
                  >
                    Proceed To Checkout
                  </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;
