import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useCreateProductMutation,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import AdminMenu from "./AdminMenu";

const ProductList = () => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [quantity, setQuantity] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [discountPercentage, setDiscountPercentage] = useState("");
  const [isFreeDelivery, setIsFreeDelivery] = useState(false);
  const navigate = useNavigate();

  const [uploadProductImage] = useUploadProductImageMutation();
  const [createProduct] = useCreateProductMutation();
  const { data: categories } = useFetchCategoriesQuery();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = new FormData();
      productData.append("image", image);
      productData.append("name", name);
      productData.append("description", description);
      productData.append("price", price);
      productData.append("category", category);
      productData.append("brand", brand);
      productData.append("countInStock", stock);
      productData.append("quantity", quantity);
      productData.append("discountPercentage", discountPercentage);
      productData.append("isFreeDelivery", isFreeDelivery);

      // Debug logging
      console.log("Form Data being sent:", {
        image: image,
        name: name,
        description: description,
        price: price,
        category: category,
        brand: brand,
        countInStock: stock,
        discountPercentage: discountPercentage,
        isFreeDelivery: isFreeDelivery
      });

      const { data } = await createProduct(productData);
      if (!data) {
        toast.error("No response from server. Check backend logs.");
        return;
      }
      if (data.error) {
        toast.error(data.error || "Product create failed. Try Again.");
      } else {
        toast.success(`${data.name} is created`);
        navigate("/");
      }
    } catch (error) {
      console.error("Full error object:", error);
      console.error("Error response data:", error?.data);
      toast.error(error?.data?.message || "Product create failed. Try Again.");
    }
  };

  const uploadFileHandler = (e) => {
    setImage(e.target.files[0]);
    setImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  // Although backendUrl is not directly used for local image preview,
  // keeping it here for potential future use or consistency.
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="w-full md:w-3/4 p-3">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">Create Product</h1>

          <div className="bg-[#1C1C1C] p-4 rounded-lg">
            {imageUrl && (
              <div className="text-center mb-4">
                <img
                  src={imageUrl}
                  alt="product"
                  className="block mx-auto w-full max-h-[200px] md:max-h-[300px] object-contain rounded"
                />
              </div>
            )}

            <div className="mb-4">
              <label className="border border-pink-500 text-pink-500 py-2 px-4 block w-full text-center rounded-lg cursor-pointer hover:bg-pink-500 hover:text-white transition-colors duration-200">
                {image ? image.name : "Upload Image"}
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={uploadFileHandler}
                  className="hidden"
                />
              </label>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm md:text-base mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm md:text-base mb-2">Price</label>
                  <input
                    type="number"
                    id="price"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm md:text-base mb-2">Quantity</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="brand" className="block text-sm md:text-base mb-2">Brand</label>
                  <input
                    type="text"
                    id="brand"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="discountPercentage" className="block text-sm md:text-base mb-2">Discount (%)</label>
                  <input
                    type="number"
                    id="discountPercentage"
                    min="0"
                    max="100"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm md:text-base mb-2">Count In Stock</label>
                  <input
                    type="number"
                    id="stock"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm md:text-base mb-2">Category</label>
                  <select
                    id="category"
                    className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                    onChange={(e) => setCategory(e.target.value)}
                    value={category}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories?.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label htmlFor="isFreeDelivery" className="flex items-center space-x-2 cursor-pointer text-sm md:text-base">
                    <input
                      type="checkbox"
                      id="isFreeDelivery"
                      checked={isFreeDelivery}
                      onChange={(e) => setIsFreeDelivery(e.target.checked)}
                      className="w-4 h-4 text-pink-600 bg-gray-100 border-gray-300 rounded focus:ring-pink-500 dark:focus:ring-pink-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span>Free Delivery</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm md:text-base mb-2">Description</label>
                <textarea
                  id="description"
                  className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="4"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="py-2 px-4 mt-4 rounded-lg text-base md:text-lg font-bold bg-pink-600 hover:bg-pink-700 transition-colors duration-200 w-full"
              >
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
