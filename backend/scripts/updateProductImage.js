import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Product from "../models/productModel.js";

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateProductImage() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find the product
    const product = await Product.findById('681e2285e52355461b5ffa9f');
    if (!product) {
      console.log('Product not found');
      return;
    }

    // Update the image to use an existing image
    product.image = '/uploads/image-1746818559318.jpg';
    await product.save();

    console.log('Product updated successfully:', {
      id: product._id,
      name: product.name,
      newImage: product.image
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

updateProductImage(); 