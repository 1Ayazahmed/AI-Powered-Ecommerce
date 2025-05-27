import path from "path";
import express from "express";
import multer from "multer";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

// Get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set the absolute path to the 'uploads' folder
const uploadDir = path.join(__dirname, "../uploads");

// Ensure 'uploads' folder exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Add debug logging
console.log("Upload directory in routes:", uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("Saving file to:", uploadDir);
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const filename = `${file.fieldname}-${Date.now()}${extname}`;
    console.log("Generated filename:", filename);
    console.log("Full file path will be:", path.join(uploadDir, filename));
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(ext) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Images only"), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

router.post("/", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      console.error("Upload error:", err);
      res.status(400).send({ message: err.message });
    } else if (req.file) {
      const filePath = path.join(uploadDir, req.file.filename);
      console.log("File uploaded successfully:", {
        filename: req.file.filename,
        path: filePath,
        mimetype: req.file.mimetype,
        exists: fs.existsSync(filePath)
      });
      
      // Verify the file exists
      if (!fs.existsSync(filePath)) {
        console.error("File was not saved correctly:", filePath);
        return res.status(500).send({ message: "File was not saved correctly" });
      }

      res.status(200).send({
        message: "Image uploaded successfully",
        image: `/uploads/${req.file.filename}`,
      });
    } else {
      console.error("No file in request");
      res.status(400).send({ message: "No image file provided" });
    }
  });
});

export default router;
