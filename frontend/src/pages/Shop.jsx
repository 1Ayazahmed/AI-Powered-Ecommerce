import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useGetFilteredProductsQuery, useGetProductsQuery } from "../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../redux/api/categoryApiSlice";
import { useLocation } from "react-router-dom";

import {
  setCategories,
  setProducts,
  setChecked,
} from "../redux/features/shop/shopSlice";
import Loader from "../components/Loader";
import ProductCard from "./Products/ProductCard";
import Message from "../components/Message";

const Shop = () => {
  const dispatch = useDispatch();
  const { categories, products, checked, radio } = useSelector(
    (state) => state.shop
  );

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchTerm = queryParams.get('keyword');

  const categoriesQuery = useFetchCategoriesQuery();
  const [priceFilter, setPriceFilter] = useState("");

  const { data: searchedProducts, isLoading: loadingSearchedProducts, error: errorSearchedProducts } = useGetProductsQuery({ 
    keyword: searchTerm || '' // Ensure we always pass a keyword parameter
  });

  const filteredProductsQuery = useGetFilteredProductsQuery({
    checked,
    radio,
  });

  // Add console logs to trace the state of the products query
  console.log('Shop.jsx Render - searchTerm:', searchTerm);
  console.log('Shop.jsx Render - loadingSearchedProducts:', loadingSearchedProducts);
  console.log('Shop.jsx Render - searchedProducts:', searchedProducts);
  console.log('Shop.jsx Render - errorSearchedProducts:', errorSearchedProducts);

  useEffect(() => {
    if (!categoriesQuery.isLoading) {
      dispatch(setCategories(categoriesQuery.data));
    }
  }, [categoriesQuery.data, dispatch]);

  useEffect(() => {
    // Handle product display based on search term or filters
    console.log('Shop.jsx useEffect - searchTerm:', searchTerm);
    console.log('Shop.jsx useEffect - loadingSearchedProducts:', loadingSearchedProducts);
    console.log('Shop.jsx useEffect - searchedProducts:', searchedProducts);
    console.log('Shop.jsx useEffect - errorSearchedProducts:', errorSearchedProducts);

    if (!loadingSearchedProducts && searchedProducts) {
      if (searchTerm) {
        // If searching, use searchedProducts
        if (Array.isArray(searchedProducts.products)) {
          console.log('Shop.jsx useEffect - Setting products from search results:', searchedProducts.products);
          dispatch(setProducts(searchedProducts.products));
        } else {
          console.log('Shop.jsx useEffect - Search returned no products structure, setting to empty array');
          dispatch(setProducts([]));
        }
      } else if (checked.length > 0 || radio.length > 0) {
        // If no search term but filters are applied, use filteredProductsQuery
        if (!filteredProductsQuery.isLoading && filteredProductsQuery.data && Array.isArray(filteredProductsQuery.data)) {
          console.log('Shop.jsx useEffect - Setting products from filter results:', filteredProductsQuery.data);
          const filteredProducts = filteredProductsQuery.data.filter(
            (product) => {
              return (
                product.price.toString().includes(priceFilter) ||
                product.price === parseInt(priceFilter, 10)
              );
            }
          );
          dispatch(setProducts(filteredProducts));
        } else {
          console.log('Shop.jsx useEffect - Filter returned no data, setting to empty array');
          dispatch(setProducts([]));
        }
      } else {
        // Initial load case - no search term and no filters
        if (Array.isArray(searchedProducts.products)) {
          console.log('Shop.jsx useEffect - Setting products from initial query:', searchedProducts.products);
          dispatch(setProducts(searchedProducts.products));
        } else {
          console.log('Shop.jsx useEffect - Initial query returned no products structure, setting to empty array');
          dispatch(setProducts([]));
        }
      }
    }
  }, [checked, radio, filteredProductsQuery.data, dispatch, priceFilter, searchTerm, searchedProducts, loadingSearchedProducts, filteredProductsQuery.isLoading]);

  const handleBrandClick = (brand) => {
    const productsByBrand = (searchTerm ? searchedProducts : filteredProductsQuery.data)?.filter(
      (product) => product.brand === brand
    );
    dispatch(setProducts(productsByBrand));
  };

  const handleCheck = (value, id) => {
    const updatedChecked = value
      ? [...checked, id]
      : checked.filter((c) => c !== id);
    dispatch(setChecked(updatedChecked));
  };

  const uniqueBrands = [
    ...Array.from(
      new Set(
        (Array.isArray(searchTerm ? searchedProducts : filteredProductsQuery.data)
          ? (searchTerm ? searchedProducts : filteredProductsQuery.data)
          : []
        )?.map((product) => product.brand)
          .filter((brand) => brand !== undefined)
      )
    ),
  ];

  const handlePriceChange = (e) => {
    setPriceFilter(e.target.value);
  };

  if (categoriesQuery.isLoading || loadingSearchedProducts || filteredProductsQuery.isLoading) {
    return <Loader />;
  }

  if (categoriesQuery.error || errorSearchedProducts || filteredProductsQuery.error) {
    return <Message variant="danger">Failed to load data.</Message>;
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Filter Sidebar */}
          <div className="bg-[#151515] p-3 mt-2 mb-2 md:w-1/4 lg:w-1/5">
            <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
              Filter by Categories
            </h2>

            {/* Category Filter */}
            <div className="p-5 w-full">
              {categories?.map((c) => (
                <div key={c._id} className="mb-2">
                  <div className="flex ietms-center mr-4">
                    <input
                      type="checkbox"
                      id="red-checkbox"
                      onChange={(e) => handleCheck(e.target.checked, c._id)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />

                    <label
                      htmlFor="pink-checkbox"
                      className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                    >
                      {c.name}
                    </label>
                  </div>
                </div>
              ))}
            </div>

            {/* Brand Filter */}
            <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
              Filter by Brands
            </h2>

            <div className="p-5 w-full">
              {uniqueBrands?.map((brand) => (
                <>
                  <div className="flex items-enter mr-4 mb-5">
                    <input
                      type="radio"
                      id={brand}
                      name="brand"
                      onChange={() => handleBrandClick(brand)}
                      className="w-4 h-4 text-pink-400 bg-gray-100 border-gray-300 focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />

                    <label
                      htmlFor="pink-radio"
                      className="ml-2 text-sm font-medium text-white dark:text-gray-300"
                    >
                      {brand}
                    </label>
                  </div>
                </>
              ))}
            </div>

            {/* Price Filter */}
            <h2 className="h4 text-center py-2 bg-black rounded-full mb-2">
              Filer by Price
            </h2>

            <div className="p-5 w-full">
              <input
                type="text"
                placeholder="Enter Price"
                value={priceFilter}
                onChange={handlePriceChange}
                className="w-full px-3 py-2 placeholder-gray-400 border rounded-lg focus:outline-none focus:ring focus:border-pink-300"
              />
            </div>

            {/* Reset Button */}
            <div className="p-5 pt-0 w-full">
              <button
                className="w-full border my-4"
                onClick={() => window.location.reload()}
              >
                Reset
              </button>
            </div>
          </div>

          {/* Product Display Area */}
          <div className="p-3 md:w-3/4 lg:w-4/5">
            <h2 className="h4 text-center mb-2">{products?.length} Products</h2>
            <div className="flex flex-wrap justify-center md:justify-start">
              {Array.isArray(products) && products.length === 0 && (searchTerm && !loadingSearchedProducts && searchedProducts?.length === 0) ? (
                 <Message variant="info">No products found for "{searchTerm}".</Message>
              ) : Array.isArray(products) && products.length === 0 ? (
                <Loader />
              ) : (
                Array.isArray(products) && products?.map((p) => (
                  <div className="p-3 w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
                    <ProductCard p={p} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Shop;
