import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import Message from "../../components/Message";
import ProgressSteps from "../../components/ProgressSteps";
import Loader from "../../components/Loader";
import { useCreateOrderMutation } from "../../redux/api/orderApiSlice";
import { clearCartItems } from "../../redux/features/cart/cartSlice";

const PlaceOrder = () => {
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart);
  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate("/shipping");
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const dispatch = useDispatch();

  const convertPrice = (priceInUSD) => {
    console.log("convertPrice called with priceInUSD:", priceInUSD);
    console.log("currentCurrency:", currentCurrency);
    console.log("exchangeRates:", exchangeRates);

    if (currentCurrency === "USD" || !exchangeRates || !exchangeRates.USD) {
      // If target is USD, or exchange rate for USD is not available
      console.log("Converting to USD or rate not available");
      return `$${priceInUSD?.toFixed(2)}`;
    } else {
      console.log("--- Starting USD to Target Conversion ---");
      console.log("Price in USD before PKR conversion:", priceInUSD);
      // First, convert USD to the base currency (PKR)
      const usdToPkrRate = 1 / exchangeRates.USD; // Rate for 1 USD in PKR
      const priceInPKR = Number(priceInUSD) * Number(usdToPkrRate);
      console.log("USD to PKR Rate:", usdToPkrRate);
      console.log("Price in PKR:", priceInPKR);

      if (currentCurrency === "PKR") {
        console.log("Target Currency is PKR, returning price in PKR");
        console.log("--- Ending USD to Target Conversion ---");
        return `PKR ${priceInPKR?.toFixed(2)}`;
      } else if (exchangeRates[currentCurrency]) {
        // Then, convert from the base currency (PKR) to the target currency
        const pkrToTargetRate = exchangeRates[currentCurrency]; // Rate for 1 PKR in target currency
        const convertedPrice = priceInPKR * pkrToTargetRate;
        console.log("PKR to Target Rate:", pkrToTargetRate);
        console.log("Converted Price:", convertedPrice);
        console.log("--- Ending USD to Target Conversion ---");
        return `${currentCurrency} ${convertedPrice.toFixed(2)}`;
      } else {
        // Fallback to displaying in USD if target currency rate is not available
        console.warn(`Exchange rate for ${currentCurrency} not available.`);
        console.log("--- Ending USD to Target Conversion (Fallback) ---");
        return `$${priceInUSD?.toFixed(2)}`;
      }
    }
  };

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error);
    }
  };

  return (
    <>
      <ProgressSteps step1 step2 step3 />

      <div className="container mx-auto mt-8">
        {cart.cartItems.length === 0 ? (
          <Message>Your cart is empty</Message>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <td className="px-1 py-2 text-left align-top">Image</td>
                  <td className="px-1 py-2 text-left">Product</td>
                  <td className="px-1 py-2 text-left">Quantity</td>
                  <td className="px-1 py-2 text-left">Price</td>
                  <td className="px-1 py-2 text-left">Total</td>
                </tr>
              </thead>

              <tbody>
                {cart.cartItems.map((item, index) => (
                  <tr key={index}>
                    <td className="p-2">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>

                    <td className="p-2">
                      <Link to={`/product/${item.product}`}>{item.name}</Link>
                    </td>
                    <td className="p-2">{item.qty}</td>
                    <td className="p-2">DEBUG_PRICE:{convertPrice(item.price)}</td>
                    <td className="p-2">
                      DEBUG_TOTAL:{convertPrice(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-5">Order Summary</h2>
          <div className="flex justify-between flex-wrap p-8 bg-[#181818]">
            <ul className="text-lg">
              <li>
                <span className="font-semibold mb-4">Items:</span>
                {console.log("Items price before convertPrice:", cart.itemsPrice)}{convertPrice(cart.itemsPrice)}
              </li>
              <li>
                <span className="font-semibold mb-4">Shipping:</span>
                {console.log("Shipping price before convertPrice:", cart.shippingPrice)}{convertPrice(cart.shippingPrice)}
              </li>
              <li>
                <span className="font-semibold mb-4">Tax:</span>
                {console.log("Tax price before convertPrice:", cart.taxPrice)}{convertPrice(cart.taxPrice)}
              </li>
              <li>
                <span className="font-semibold mb-4">Total:</span>
                {console.log("Total price before convertPrice:", cart.totalPrice)}{convertPrice(cart.totalPrice)}&nbsp;
              </li>
            </ul>

            {error && <Message variant="danger">{error.data.message}</Message>}

            <div>
              <h2 className="text-2xl font-semibold mb-4">Shipping</h2>
              <p>
                <strong>Address:</strong> {cart.shippingAddress.address},{" "}
                {cart.shippingAddress.city} {cart.shippingAddress.postalCode},{" "}
                {cart.shippingAddress.country}
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Payment Method</h2>
              <strong>Method:</strong> {cart.paymentMethod}
            </div>
          </div>

          <button
            type="button"
            className="bg-pink-500 text-white py-2 px-4 rounded-full text-lg w-full mt-4"
            disabled={cart.cartItems === 0}
            onClick={placeOrderHandler}
          >
            Place Order
          </button>

          {isLoading && <Loader />}
        </div>
      </div>
    </>
  );
};

export default PlaceOrder;
