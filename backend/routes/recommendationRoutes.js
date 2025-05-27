import express from "express";
import axios from "axios";
import Product from "../models/productModel.js";

const router = express.Router();

router.post("/recommend", async (req, res) => {
  try {
    const { productId } = req.body;

    // Send request to Flask AI server
    const flaskRes = await axios.post("http://localhost:5001/recommend", {
      productId,
    });

    const recommended = flaskRes.data;

    res.json(recommended);
  } catch (error) {
    console.error("Recommendation error:", error.message);
    res.status(500).json({ message: "Failed to fetch recommendations" });
  }
});

export default router;
