import Message from "../../components/Message";
import Loader from "../../components/Loader";
import { Link } from "react-router-dom";
import { 
  useGetOrdersQuery, 
  useDeliverOrderMutation,
  useDeleteOrderMutation,
  useMarkOrderAsApprovedMutation
} from "../../redux/api/orderApiSlice";
import AdminMenu from "./AdminMenu";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

const OrderList = () => {
  const { data: orders, isLoading, error, refetch } = useGetOrdersQuery();
  const [deliverOrder] = useDeliverOrderMutation();
  const [deleteOrder] = useDeleteOrderMutation();
  const [markOrderAsApproved, { isLoading: isApproving }] = useMarkOrderAsApprovedMutation();
  const { currentCurrency, exchangeRates } = useSelector((state) => state.currency);

  const convertPrice = (priceInUSD) => {
    if (currentCurrency === "USD" || !exchangeRates || !exchangeRates.USD) {
      return `$${priceInUSD?.toFixed(2)}`;
    } else {
      const usdToPkrRate = 1 / exchangeRates.USD; // Rate for 1 USD in PKR
      const priceInPKR = Number(priceInUSD) * Number(usdToPkrRate);

      if (currentCurrency === "PKR") {
        return `PKR ${priceInPKR?.toFixed(2)}`;
      } else if (exchangeRates[currentCurrency]) {
        const pkrToTargetRate = exchangeRates[currentCurrency]; // Rate for 1 PKR in target currency
        const convertedPrice = priceInPKR * pkrToTargetRate;
        return `${currentCurrency} ${convertedPrice.toFixed(2)}`;
      } else {
        console.warn(`Exchange rate for ${currentCurrency} not available.`);
        return `$${priceInUSD?.toFixed(2)}`;
      }
    }
  };

  const deliverHandler = async (id) => {
    try {
      await deliverOrder(id);
      refetch();
      toast.success("Order marked as delivered");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        refetch();
        toast.success("Order deleted successfully");
      } catch (error) {
        toast.error(error?.data?.message || error.message);
      }
    }
  };

  const approveHandler = async (id) => {
    try {
      await markOrderAsApproved(id);
      refetch();
      toast.success("Order marked as approved");
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <AdminMenu />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full table-auto border-collapse">
            <thead className="w-full border-b border-gray-700">
              <tr>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[5rem]">ITEMS</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">ID</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">USER</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[6rem]">DATE</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[6rem]">TOTAL</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[6rem]">PAID</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">APPROVAL</th>
                <th className="text-left py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="border-b border-gray-700">
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[5rem]">
                    <img
                      src={order.orderItems[0].image}
                      alt={order._id}
                      className="w-[2.5rem] h-[2.5rem] sm:w-[3rem] sm:h-[3rem] object-cover"
                    />
                  </td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base break-words min-w-[8rem]">{order._id}</td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base break-words min-w-[8rem]">{order.user ? order.user.username : "N/A"}</td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[6rem]">
                    {order.createdAt ? order.createdAt.substring(0, 10) : "N/A"}
                  </td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base break-words min-w-[6rem]">{convertPrice(order.totalPrice)}</td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[6rem]">
                    {order.isPaid ? (
                      <p className="p-1 text-center bg-green-400 text-white text-xs rounded-full w-[4rem] sm:w-[5rem]">Completed</p>
                    ) : (
                      <p className="p-1 text-center bg-red-400 text-white text-xs rounded-full w-[4rem] sm:w-[5rem]">Pending</p>
                    )}
                  </td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">
                    {order.isApproved ? (
                      <p className="p-1 text-center bg-green-400 text-white text-xs rounded-full w-[4rem] sm:w-[5rem]">Approved</p>
                    ) : (
                      <p className="p-1 text-center bg-red-400 text-white text-xs rounded-full w-[4rem] sm:w-[5rem]">Pending</p>
                    )}
                  </td>
                  <td className="py-2 pl-1 pr-2 text-xs sm:text-sm md:pl-4 md:pr-3 md:text-base min-w-[8rem]">
                    <div className="flex flex-col space-y-1 sm:space-y-2">
                      <Link to={`/order/${order._id}`}>
                        <button className="bg-blue-500 text-white text-xs py-1 px-2 rounded w-full text-center">View</button>
                      </Link>
                      {order.isPaid && !order.isDelivered && (
                        <button
                          onClick={() => deliverHandler(order._id)}
                          className="bg-green-500 text-white text-xs py-1 px-2 rounded w-full text-center"
                        >
                          Deliver
                        </button>
                      )}
                      {!order.isApproved && (
                        <button
                          onClick={() => approveHandler(order._id)}
                          className="bg-yellow-500 text-white text-xs py-1 px-2 rounded w-full text-center"
                          disabled={isApproving}
                        >
                          {isApproving ? '...' : 'Approve'}
                        </button>
                      )}
                      <button
                        onClick={() => deleteHandler(order._id)}
                        className="bg-red-500 text-white text-xs py-1 px-2 rounded w-full text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList;
