import { useState, useEffect } from "react";
import AdminMenu from "./AdminMenu";
import { useNavigate, useParams } from "react-router-dom";
import {
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetProductByIdQuery,
  useUploadProductImageMutation,
} from "../../redux/api/productApiSlice";
import { useFetchCategoriesQuery } from "../../redux/api/categoryApiSlice";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";

const AdminProductUpdate = () => {
  const params = useParams();

  const { data: productData, isLoading: isProductLoading } = useGetProductByIdQuery(params._id);

  const [image, setImage] = useState(productData?.image || "");
  const [name, setName] = useState(productData?.name || "");
  const [description, setDescription] = useState(productData?.description || "");
  const [price, setPrice] = useState(productData?.price || "");
  const [category, setCategory] = useState(productData?.category || "");
  const [quantity, setQuantity] = useState(productData?.quantity || "");
  const [brand, setBrand] = useState(productData?.brand || "");
  const [stock, setStock] = useState(productData?.countInStock);
  const [discountPercentage, setDiscountPercentage] = useState(productData?.discountPercentage || 0);
  const [isFreeDelivery, setIsFreeDelivery] = useState(productData?.isFreeDelivery || false);
  const [selectedFile, setSelectedFile] = useState(null);

  const navigate = useNavigate();
  const { data: categories = [] } = useFetchCategoriesQuery();
  const [uploadProductImage] = useUploadProductImageMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();

  useEffect(() => {
    if (productData && productData._id) {
      setName(productData.name);
      setDescription(productData.description);
      setPrice(productData.price);
      setCategory(productData.category?._id);
      setQuantity(productData.quantity);
      setBrand(productData.brand);
      setImage(productData.image);
      setStock(productData.countInStock);
      setDiscountPercentage(productData.discountPercentage || 0);
      setIsFreeDelivery(productData.isFreeDelivery || false);
    }
  }, [productData]);

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success("Image uploaded successfully");
      setImage(res.image);
    } catch (err) {
      toast.error(err?.data?.message || "Image upload failed. Try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        _id: params._id,
        name,
        description,
        price: Number(price),
        category,
        quantity: Number(quantity),
        brand,
        countInStock: Number(stock),
        discountPercentage: Number(discountPercentage),
        isFreeDelivery,
      };

      let data;

      if (selectedFile) {
        const formData = new FormData();
        formData.append("image", selectedFile);
        formData.append("_id", productData._id);
        formData.append("name", productData.name);
        formData.append("description", productData.description);
        formData.append("price", productData.price);
        formData.append("category", productData.category);
        formData.append("quantity", productData.quantity);
        formData.append("brand", productData.brand);
        formData.append("countInStock", productData.countInStock);
        formData.append("discountPercentage", productData.discountPercentage);
        formData.append("isFreeDelivery", productData.isFreeDelivery);

        const response = await updateProduct({ productId: params._id, formData });
        data = response.data;
      } else {
        const response = await updateProduct({ 
          productId: params._id, 
          productData 
        });
        data = response.data;
      }

      if (data?.error) {
        toast.error(data.error);
      } else {
        toast.success(`Product successfully updated`);
        navigate("/admin/allproductslist");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Product update failed. Try again.");
    }
  };

  const handleDelete = async () => {
    try {
      let answer = window.confirm("Are you sure you want to delete this product?");
      if (!answer) return;

      const { data } = await deleteProduct(params._id);
      toast.success(`"${data.name}" is deleted`);
      navigate("/admin/allproductslist");
    } catch (err) {
      console.log(err);
      toast.error("Delete failed. Try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row">
        <AdminMenu />
        <div className="w-full md:w-3/4 p-3">
          <h1 className="text-xl md:text-2xl font-semibold mb-4">Update / Delete Product</h1>

          {isProductLoading ? (
            <Loader />
          ) : (
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
              {image && (
                <div className="text-center mb-4">
                  <img
                    src={selectedFile ? URL.createObjectURL(selectedFile) : image}
                    alt="product"
                    className="block mx-auto w-full max-h-[200px] md:max-h-[300px] object-contain rounded"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="border border-pink-500 text-pink-500 py-2 px-4 block w-full text-center rounded-lg cursor-pointer hover:bg-pink-500 hover:text-white transition-colors duration-200">
                  {selectedFile ? selectedFile.name : (image ? image.split('/').pop() : "Upload image")}
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
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block text-sm md:text-base mb-2">Category</label>
                    <select
                      id="category"
                      className="p-2 w-full border rounded-lg bg-[#101011] text-white text-sm md:text-base"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="">Select Category</option>
                      {categories?.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center">
                    <label htmlFor="isFreeDelivery" className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        id="isFreeDelivery"
                        className="w-4 h-4 rounded border-gray-300"
                        checked={isFreeDelivery}
                        onChange={(e) => setIsFreeDelivery(e.target.checked)}
                      />
                      <span className="text-sm md:text-base">Free Delivery</span>
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
                  ></textarea>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    type="submit"
                    className="py-2 px-6 rounded-lg text-base md:text-lg font-bold bg-green-600 hover:bg-green-700 transition-colors duration-200"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="py-2 px-6 rounded-lg text-base md:text-lg font-bold bg-pink-600 hover:bg-pink-700 transition-colors duration-200"
                  >
                    Delete
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductUpdate;
