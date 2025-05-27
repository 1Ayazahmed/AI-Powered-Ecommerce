// backend/scripts/cleanupProductImages.js
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import Product from "../models/productModel.js";

// Get __dirname for ESM
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Load .env variables from backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("Current working directory:", process.cwd());
console.log("Looking for .env at:", path.resolve(__dirname, '../.env'));
console.log("MONGO_URI:", process.env.MONGO_URI);

// Path to uploads directory (relative to backend)
const uploadsDir = path.resolve(__dirname, '../uploads');
const defaultImage = "/uploads/default.jpg";

async function cleanupProductImages() {
  await mongoose.connect(process.env.MONGO_URI);

  const products = await Product.find({});
  let updated = 0;

  for (let product of products) {
    if (product.image) {
      const filename = product.image.split("/").pop();
      const filePath = path.join(uploadsDir, filename);

      if (!fs.existsSync(filePath)) {
        console.log(`Missing file for product "${product.name}": ${product.image}`);
        product.image = defaultImage;
        await product.save();
        updated++;
      }
    }
  }

  console.log(`Cleanup complete. Updated ${updated} products.`);
  mongoose.disconnect();
}

cleanupProductImages();