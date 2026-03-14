import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        status: 0,
        message: "Login Required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        status: 0,
        message: "User Not Found",
      });
    }
    req.user = user; // attach user to request
    next(); // move to controller

  } catch (error) {
    return res.status(401).json({
      status: 0,
      message: "Invalid Token , Login Again",
    });
  }
};
