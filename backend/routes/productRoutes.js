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
  fetchDiscountedProducts,
  createFeedbackForProduct,
} from "../controllers/productController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkId.js";
import { upload } from "../middlewares/multerMiddleware.js";

// Routes

// Static routes first
router.route("/").get(fetchProducts);
router.route("/allproducts").get(fetchAllProducts);
router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.route("/discounted").get(fetchDiscountedProducts);
router.route("/filtered-products").post(filterProducts);

// Routes with dynamic :id parameter
router.route("/:id/reviews").post(authenticate, checkId, addProductReview);
router.route("/:id/feedback").post(authenticate, (req, res, next) => {
  console.log("HIT /api/products/:id/feedback POST (createFeedbackForProduct)");
  createFeedbackForProduct(req, res, next);
});
router.route("/:id/details").put(authenticate, authorizeAdmin, updateProductDetails);

// General :id route last
router
  .route("/:id")
  .get(fetchProductById)
  .put(authenticate, authorizeAdmin, upload.single("image"), updateProductDetails)
  .delete(authenticate, authorizeAdmin, removeProduct);

// Route for adding products (uses authenticate and authorizeAdmin)
router
  .route("/")
  .post(authenticate, authorizeAdmin, upload.single("image"), (req, res, next) => {
    console.log("HIT /api/products POST (addProduct)");
    addProduct(req, res, next);
  });

export default router;
