import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const registerUser = async (req, res) => {
  const { name , email, password } = req.body;

  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    // Simulate user registration (in real app, save to DB
    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+.])(?=.{8,})/;
    if (!emailFormat.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!passwordFormat.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name , email, password: hashedPassword });

    await user.save();

    if (user) {
      res
        .status(201)
        .json({ message: "User registered successfully", success: true });
    } else {
      res
        .status(400)
        .json({ message: "User registration failed", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error Occured: ${error.message}`, success: false });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }

    const emailFormat = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordFormat =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()\-+.])(?=.{8,})/;
    if (!emailFormat.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    if (!passwordFormat.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, number and special character",
      });
    }
    // Simulate user login (in real app, check DB and generate token)
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "Email is not registered", success: false });
    }
    const isPasswordValid = await bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ message: "Email or Password is incorrect", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7h",
    });

    res.cookie("token", token, { httpOnly: true , secure: true, sameSite: "none" });
    res.status(200).send({ data : {email: user.email, name: user.name} , message: "Login successful", success: true });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error Occured: ${error.message}`, success: false });
  }
};

export const logoutUser = (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "none" });
  res.status(200).json({ message: "Logout successful", success: true });
}
