import { useState } from "react";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useFetchCategoriesQuery,
} from "../../redux/api/categoryApiSlice";

import { toast } from "react-toastify";
import CategoryForm from "../../components/CategoryForm";
import Modal from "../../components/Modal";
import AdminMenu from "./AdminMenu";

const CategoryList = () => {
  const { data: categories } = useFetchCategoriesQuery();
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [updatingName, setUpdatingName] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const handleCreateCategory = async (e) => {
    e.preventDefault();

    if (!name) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await createCategory({ name }).unwrap();
      if (result.error) {
        toast.error(result.error);
      } else {
        setName("");
        toast.success(`${result.name} is created.`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Creating category failed, try again.");
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();

    if (!updatingName) {
      toast.error("Category name is required");
      return;
    }

    try {
      const result = await updateCategory({
        categoryId: selectedCategory._id,
        updatedCategory: {
          name: updatingName,
        },
      }).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is updated`);
        setSelectedCategory(null);
        setUpdatingName("");
        setModalVisible(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const result = await deleteCategory(selectedCategory._id).unwrap();

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${result.name} is deleted.`);
        setSelectedCategory(null);
        setModalVisible(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Category deletion failed. Try again.");
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row">
      <AdminMenu />
        <div className="w-full md:w-3/4 p-3">
          <h1 className="text-xl md:text-2xl font-bold mb-4">Manage Categories</h1>
          
          <div className="bg-[#1C1C1C] p-4 rounded-lg mb-6">
        <CategoryForm
          value={name}
          setValue={setName}
          handleSubmit={handleCreateCategory}
        />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {categories?.map((category) => (
              <button
                key={category._id}
                className="bg-[#1C1C1C] border border-pink-500 text-pink-500 py-2 px-3 md:px-4 rounded-lg hover:bg-pink-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 w-full text-sm md:text-base transition-colors duration-200"
                onClick={() => {
                    setModalVisible(true);
                    setSelectedCategory(category);
                    setUpdatingName(category.name);
                }}
              >
                {category.name}
              </button>
          ))}
        </div>

        <Modal isOpen={modalVisible} onClose={() => setModalVisible(false)}>
            <div className="bg-[#1C1C1C] p-4 rounded-lg">
          <CategoryForm
            value={updatingName}
            setValue={(value) => setUpdatingName(value)}
            handleSubmit={handleUpdateCategory}
            buttonText="Update"
            handleDelete={handleDeleteCategory}
          />
            </div>
        </Modal>
        </div>
      </div>
    </div>
  );
};

export default CategoryList;
