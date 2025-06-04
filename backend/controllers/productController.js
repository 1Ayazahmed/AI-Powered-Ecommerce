import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";
import fs from "fs";
import path from "path";
import Feedback from "../models/feedbackModel.js";

// const addProduct = asyncHandler(async (req, res) => {
//   try {
//     // const { name, description, price, category, quantity, brand } = req.fields;
//     const { name, description, price, category, quantity, brand, countInStock } = req.body;



//     // Validation
//     switch (true) {
//       case !name:
//         return res.json({ error: "Name is required" });
//       case !brand:
//         return res.json({ error: "Brand is required" });
//       case !description:
//         return res.json({ error: "Description is required" });
//       case !price:
//         return res.json({ error: "Price is required" });
//       case !category:
//         return res.json({ error: "Category is required" });
//       case !quantity:
//         return res.json({ error: "Quantity is required" });
//     }

// //     const product = new Product({ ...req.fields });
// //     await product.save();
// //     res.json(product);
// //     console.log(product)
// //   } catch (error) {
// //     console.error(error);
// //     res.status(400).json(error.message);
// //   }
// // });


// const product = new Product({
//   name,
//   description,
//   price,
//   category,
//   quantity,
//   brand,
//   countInStock,
// });
// await product.save();
// res.json(product);
// console.log(product)
// console.log("BODY", req.body);
// console.log("FILES", req.file || req.files);

// } catch (error) {
// console.error(error);
// res.status(400).json(error.message);
// }
// });






// const updateProductDetails = asyncHandler(async (req, res) => {
//   try {
//     // const { name, description, price, category, quantity, brand } = req.fields;
//     const { name, description, price, category, quantity, brand, countInStock } = req.body;


//     // Validation
//     switch (true) {
//       case !name:
//         return res.json({ error: "Name is required" });
//       case !brand:
//         return res.json({ error: "Brand is required" });
//       case !description:
//         return res.json({ error: "Description is required" });
//       case !price:
//         return res.json({ error: "Price is required" });
//       case !category:
//         return res.json({ error: "Category is required" });
//       case !quantity:
//         return res.json({ error: "Quantity is required" });
//     }

//     const product = await Product.findByIdAndUpdate(
//       req.params.id,
//       { ...req.fields },
//       { new: true }
//     );

//     await product.save();

//     res.json(product);
//   } catch (error) {
//     console.error(error);
//     res.status(400).json(error.message);
//   }
// });



// ---------------chatgpt code of update and add product-----------------

// Add Product
const addProduct = async (req, res) => {
  try {
    console.log('addProduct - BODY:', req.body);
    console.log('addProduct - FILE:', req.file);
    console.log('addProduct - USER:', req.user);
    const {
      name,
      description,
      brand,
      price,
      category,
      countInStock,
      quantity,
      discountPercentage,
      isFreeDelivery,
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    const discountedPrice = price * (1 - (discountPercentage || 0) / 100);

    const product = new Product({
      name,
      description,
      brand,
      price,
      category,
      countInStock,
      quantity,
      image,
      user: req.user._id,
      discountPercentage: discountPercentage || 0,
      isFreeDelivery: isFreeDelivery || false,
      discountedPrice,
    });

    console.log('addProduct - Saving product:', product);

    const createdProduct = await product.save();
    console.log('addProduct - Created product:', createdProduct);

    res.status(201).json(createdProduct);
  } catch (err) {
    console.error('addProduct - Error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Update Product
const updateProductDetails = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    console.log('updateProductDetails - Req Body:', req.body);
    console.log('updateProductDetails - Req File:', req.file);

    const updateFields = {
      name: req.body.name !== undefined ? req.body.name : product.name,
      description: req.body.description !== undefined ? req.body.description : product.description,
      brand: req.body.brand !== undefined ? req.body.brand : product.brand,
      price: req.body.price !== undefined ? req.body.price : product.price,
      category: req.body.category !== undefined ? req.body.category : product.category,
      countInStock: req.body.countInStock !== undefined ? req.body.countInStock : product.countInStock,
      quantity: req.body.quantity !== undefined ? req.body.quantity : product.quantity,
      discountPercentage: req.body.discountPercentage !== undefined ? req.body.discountPercentage : product.discountPercentage,
      isFreeDelivery: req.body.isFreeDelivery !== undefined ? req.body.isFreeDelivery : product.isFreeDelivery,
    };

    const newPrice = updateFields.price;
    const newDiscountPercentage = updateFields.discountPercentage;
    updateFields.discountedPrice = newPrice * (1 - (newDiscountPercentage || 0) / 100);

    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join("uploads", path.basename(product.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateFields.image = `/uploads/${req.file.filename}`;
    }

    console.log('updateProductDetails - Update Fields:', updateFields);

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true }
    );

    console.log('updateProductDetails - Updated Product:', updatedProduct);

    res.json(updatedProduct);
  } catch (err) {
    console.error('updateProductDetails - Error:', err);
    res.status(500).json({ message: err.message });
  }
};





// ---------------chatgpt code of update and add product-----------------



const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const uploadsDir = path.join(process.cwd(), "backend", "uploads");
const defaultImage = "/uploads/default.jpg";

function ensureImageExists(product) {
  console.log('\nChecking product image:', {
    productId: product._id,
    productName: product.name,
    originalImage: product.image
  });

  // If product.image is provided, use it directly
  if (product.image) {
    console.log('Image path provided, using:', product.image);
    return product; // Use the provided image path
  } else {
    // If no image is provided, use the default image
    console.log('No image path provided, using default:', defaultImage);
    product.image = defaultImage;
  }
  return product;
}

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;

    // Initialize keyword as an empty object for initial load
    let keyword = {};

    // Only set up search query if keyword exists and is not empty
    if (req.query.keyword && req.query.keyword.trim()) {
      const searchTerm = req.query.keyword.trim();
      keyword = {
        $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { brand: { $regex: searchTerm, $options: 'i' } }
        ]
      };
    }

    console.log('Backend fetchProducts - keyword:', keyword);

    // Modify the find query to potentially include pagination and limit here if needed for the initial load
    let baseQuery = Product.find(keyword);

    // Apply pagination limit only if a keyword is present
    if (req.query.keyword && req.query.keyword.trim()) {
      baseQuery = baseQuery.limit(pageSize);
    }

    const count = await Product.countDocuments(keyword);
    console.log('Backend fetchProducts - count:', count);

    const products = await baseQuery;
    console.log('Backend fetchProducts - products before ensureImageExists:', products);

    const productsWithImages = products.map(p => ensureImageExists(p));
    console.log('Backend fetchProducts - products after ensureImageExists:', productsWithImages);

    res.json({
      products: productsWithImages,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: count > pageSize
    });
  } catch (error) {
    console.error('Backend fetchProducts - Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      ensureImageExists(product);
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    let products = await Product.find({})
      .populate("category")
      .sort({ createAt: -1 });
    products = products.map(p => ensureImageExists(p));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    let products = await Product.find({}).sort({ rating: -1 }).limit(4);
    products = products.map(p => ensureImageExists(p));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    let products = await Product.find().sort({ _id: -1 }).limit(5);
    products = products.map(p => ensureImageExists(p));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };

    let products = await Product.find(args);
    products = products.map(p => ensureImageExists(p));
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Fetch Discounted Products
const fetchDiscountedProducts = asyncHandler(async (req, res) => {
  try {
    // Find products with discountPercentage greater than 0
    let products = await Product.find({ discountPercentage: { $gt: 0 } });

    // Ensure images exist for the fetched products
    products = products.map(p => ensureImageExists(p));

    res.json(products);
  } catch (error) {
    console.error('Backend fetchDiscountedProducts - Error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Controller function for creating feedback for a product
const createFeedbackForProduct = asyncHandler(async (req, res) => {
  console.log("Feedback submission request received!");
  console.log("Inside createFeedbackForProduct");
  console.log("Req Body:", req.body);
  console.log("Req Params:", req.params);
  console.log("Req User:", req.user);
  const { rating, comment } = req.body;
  const { id: productId } = req.params;
  const user = req.user._id; // Get user ID from authenticated user

  // Basic validation
  if (!rating || !comment) {
    res.status(400);
    throw new Error('Please provide a rating and comment.');
  }

  // Check if the product exists (optional but good practice)
  const productExists = await Product.findById(productId);
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found.');
  }

  // Create new feedback
  const feedback = new Feedback({
    product: productId,
    user: user,
    rating,
    comment,
  });

  const createdFeedback = await feedback.save();

  // Optionally, you might want to update the product with the new feedback reference or recalculate average rating
  // productExists.feedback.push(createdFeedback._id); // If you store feedback references in the product model
  // await productExists.save();

  res.status(201).json(createdFeedback);
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  console.log('Attempting to create product review');
  console.log('Request body:', req.body);
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

export {
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
  createProductReview,
};
