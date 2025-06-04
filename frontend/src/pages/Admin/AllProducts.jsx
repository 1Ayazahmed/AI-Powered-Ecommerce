import { Link } from "react-router-dom";
import moment from "moment";
import { useAllProductsQuery } from "../../redux/api/productApiSlice";
import AdminMenu from "./AdminMenu";
import Loader from "../../components/Loader";
import Message from "../../components/Message";

const AllProducts = () => {
  const { data: products, isLoading, isError } = useAllProductsQuery();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return <Message variant="danger">Error loading products</Message>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="w-full md:w-3/4 p-3">
          <h1 className="text-xl md:text-2xl font-bold mb-4 md:ml-4">
              All Products ({products.length})
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/admin/product/update/${product._id}`}
                className="block overflow-hidden bg-[#1C1C1C] rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.image}
                      alt={product.name}
                    className="w-full h-40 sm:h-48 object-cover"
                    />
                </div>
                <div className="p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
                    <h5 className="text-base md:text-lg font-semibold text-white line-clamp-1">
                          {product?.name}
                        </h5>
                        <p className="text-gray-400 text-xs">
                      {moment(product.createdAt).format("MMM D, YYYY")}
                        </p>
                      </div>

                  <p className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">
                    {product?.description}
                      </p>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <p className="text-base md:text-lg font-bold text-white">$ {product?.price}</p>
                        <Link
                          to={`/admin/product/update/${product._id}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 text-xs md:text-sm font-medium text-center text-white bg-pink-700 rounded-lg hover:bg-pink-800 focus:ring-4 focus:outline-none focus:ring-pink-300 dark:bg-pink-600 dark:hover:bg-pink-700 dark:focus:ring-pink-800"
                        >
                          Update Product
                          <svg
                        className="w-3 h-3 md:w-3.5 md:h-3.5 ml-2"
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
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
