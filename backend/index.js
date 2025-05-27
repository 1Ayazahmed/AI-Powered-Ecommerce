import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';

// Utils
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import recommendationRoutes from './routes/recommendationRoutes.js';
import aiRoutes from './routes/ai.routes.js';


// Handle __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Load .env variables
dotenv.config();

// Debug: Print all relevant backend env variables
console.log("Upload directory path:", uploadDir); //
// Debug: Print all relevant backend env variables
// console.log("MONGO_URI:", process.env.MONGO_URI); // Should print your MongoDB URI
// console.log("JWT_SECRET:", process.env.JWT_SECRET); // Should print your JWT secret
// console.log("CWD:", process.cwd());
// console.log("ENV FILE EXISTS:", fs.existsSync(process.cwd() + '/.env'));

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api', recommendationRoutes);

console.log('Registering AI routes under /api/ai_features_test', aiRoutes);
app.use('/api/ai_features_test', aiRoutes);

// PayPal Config Route
app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

// Static folder for uploaded images
const uploadsPath = path.join(__dirname, "uploads");
console.log("Serving static files from:", uploadsPath);

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  console.log("Creating uploads directory:", uploadsPath);
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// List files in uploads directory
// console.log("Files in uploads directory:", fs.readdirSync(uploadsPath));

// Serve static files with more explicit configuration
app.use("/uploads", express.static(uploadsPath, {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    console.log("Serving file:", path);
  },
  dotfiles: 'allow',
  index: false
}));

// Add a test route to check if static files are being served
app.get("/test-uploads", (req, res) => {
  const files = fs.readdirSync(uploadsPath);
  res.json({
    uploadsPath,
    files,
    exists: fs.existsSync(uploadsPath),
    absolutePath: path.resolve(uploadsPath)
  });
});

// Add a test route to directly serve an image
app.get("/test-image/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({
      error: "File not found",
      path: filePath,
      exists: fs.existsSync(filePath)
    });
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port: ${port}`));
