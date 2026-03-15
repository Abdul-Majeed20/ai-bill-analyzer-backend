import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import billRouter from "./routes/billRoutes.js";
import authRouter from "./routes/authRoutes.js";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import { authMiddleware } from "./middleware/authMiddleware.js";

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" })); // Increase payload limit for OCR data
dotenv.config();
app.use(cookieParser());

app.use(
  cors({
    origin: ["*", "http://localhost:5173"],
    credentials: true,
  }),
);

app.use(express.json());

connectDB();

app.use("/api/v1/auth", authRouter);

app.use("/api/v1/auth/me", authMiddleware, (req, res) => {
  res.status(200).json({
    status: 1,
    data: req.user,
  });
});

app.use("/api/v1/bill", authMiddleware, billRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
