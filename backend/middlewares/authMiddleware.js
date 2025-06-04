import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "./asyncHandler.js";

const authenticate = asyncHandler(async (req, res, next) => {
  console.log("Authenticate middleware started.");
  let token;

  // Read JWT from the 'jwt' cookie
  token = req.cookies.jwt;
  console.log("Token read from cookie:", token);

  if (token) {
    console.log("Token found, attempting verification.");
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified. Decoded user ID:", decoded.userId);
      req.user = await User.findById(decoded.userId).select("-password");
      console.log("User found:", req.user ? req.user.username : "None");
      next();
    } catch (error) {
      console.error("Authentication failed:", error);
      res.status(401);
      throw new Error("Not authorized, token failed.");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token.");
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send("Not authorized as an admin.");
  }
};

export { authenticate, authorizeAdmin };
