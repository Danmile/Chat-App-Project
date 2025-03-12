import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, gender } = req.body;
    if ((!fullName || !email || !password, !gender)) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    if (password.length < 6) {
      res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      gender,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate jwt
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).send(newUser);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).send("Server Error");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    generateToken(user._id, res);

    res.status(200).send(user);
  } catch (error) {
    console.log("Error in login", error.message);
    res.status(500).send("Server Error");
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout", error.message);
    res.status(500).send("Server Error");
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: "danmil511@gmail.com", pass: "jzsz imjc oeba gfin" },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = resetToken;
    user.resetTokenExpiry = Date.now() + 3600000; // 1-hour expiry
    await user.save();

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    const mailOptions = {
      from: "danmil511@gmail.com",
      to: user.email,
      subject: "ChatApp - reset your password",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. The link expires in 1 hour.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    console.log("Error in changePassword", error.message);
    res.status(500).send("Server Error");
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const user = await User.findOne({
      resetToken: token,
    });
    if (!user) {
      return res.status(400).json({ message: "Expired session" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    generateToken(user._id, res);
    await user.save();

    res.json(user);
  } catch (error) {
    console.log("Error in resetPassword", error.message);
    res.status(500).send("Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkAuth = (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    console.log("Error in checkAuth", error.message);
    res.status(500).send("Server Error");
  }
};
