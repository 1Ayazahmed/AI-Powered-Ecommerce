import express from "express";
const router = express.Router();

import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
} from "../controllers/productController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";
import { upload } from "../middlewares/multerMiddleware.js";

// Routes
router
  .route("/")
  .get(fetchProducts)
  .post(authenticate, authorizeAdmin, upload.single("image"), addProduct);

router.route("/allproducts").get(fetchAllProducts);
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);
router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);

router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, upload.single("image"), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

// New route for updating product details without image upload
router.route("/:id/details").put(authenticate, authorizeAdmin, updateProductDetails);

router.route("/filtered-products").post(filterProducts);

export default router;
