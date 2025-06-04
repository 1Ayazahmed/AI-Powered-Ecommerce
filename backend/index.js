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
import feedbackRoutes from './routes/feedbackRoutes.js';


// Handle __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Load .env variables from the correct location
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug: Print all relevant backend env variables
console.log("Attempting to load .env from:", path.join(__dirname, '.env'));
console.log("MONGO_URI after dotenv config:", process.env.MONGO_URI);

// Debug: Print all relevant backend env variables
// console.log("Upload directory path:", uploadDir); //
// Debug: Print all relevant backend env variables
// console.log("JWT_SECRET:", process.env.JWT_SECRET); // Should print your MongoDB URI
// console.log("CWD:", process.cwd());
// console.log("ENV FILE EXISTS:", fs.existsSync(process.cwd() + '/.env'));

const port = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize express app
const app = express();

// Middleware


app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
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
app.use("/api/feedback", feedbackRoutes);

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

// Serve static files with more explicit configuration
app.use("/uploads", (req, res, next) => {
  console.log(`Static file request: ${req.method} ${req.url}`);
  const filePath = path.join(uploadsPath, req.url);
  console.log(`Attempting to serve file: ${filePath}`);
  
  if (fs.existsSync(filePath)) {
    console.log(`File exists: ${filePath}`);
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error sending file ${filePath}:`, err);
        res.status(err.status || 500).json({ error: 'Failed to send file', details: err.message });
      } else {
        console.log(`Successfully sent file ${filePath}`);
      }
    });
  } else {
    console.log(`File not found: ${filePath}`);
    res.status(404).json({
      error: "File not found",
      path: filePath,
      exists: fs.existsSync(filePath)
    });
  }
});

// Add a test route to check if static files are being served
app.get("/test-uploads", (req, res) => {
  console.log(`Test uploads request: ${req.method} ${req.url}`);
  const files = fs.readdirSync(uploadsPath);
  const uploadsInfo = {
    uploadsPath,
    files,
    exists: fs.existsSync(uploadsPath),
    absolutePath: path.resolve(uploadsPath)
  };
  console.log('Test uploads response:', uploadsInfo);
  res.json(uploadsInfo);
});

// Add a test route to directly serve an image
app.get("/test-image/:filename", (req, res) => {
  console.log(`Test image request: ${req.method} ${req.url}`);
  const filename = req.params.filename;
  const filePath = path.join(uploadsPath, filename);
  
  if (fs.existsSync(filePath)) {
    console.log(`File exists for test-image: ${filePath}`);
    res.sendFile(filePath, (err) => {
      if (err) {
        console.error(`Error sending file ${filePath} via test-image route:`, err);
        res.status(err.status || 500).json({ error: 'Failed to send file', details: err.message });
      } else {
        console.log(`Successfully sent file ${filePath} via test-image route.`);
      }
    });
  } else {
    console.log(`File not found for test-image: ${filePath}`);
    res.status(404).json({
      error: "File not found",
      path: filePath,
      exists: fs.existsSync(filePath)
    });
  }
});

// Start server
app.listen(port, () => console.log(`Server running on port: ${port}`));
