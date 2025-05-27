import axios from "axios";
import Product from "../models/productModel.js";

export const getRecommendations = async (productId) => {
  try {
    const allProducts = await Product.find({}, "_id name description");

    const response = await axios.post("http://localhost:5001/recommend", {
      productId,
      products: allProducts.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        description: p.description,
      })),
    });

    const recommendedIds = response.data.recommended;

    const recommendedProducts = await Product.find({
      _id: { $in: recommendedIds },
    });

    return recommendedProducts;
  } catch (error) {
    console.error("Recommendation error:", error.message);
    return [];
  }
};
