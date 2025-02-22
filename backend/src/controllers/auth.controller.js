import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).send("All fields are required!");
    }
    if (password.length < 6) {
      res.status(400).send("Password must be at least 6 characters");
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).send("Email already exists");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // Generate jwt
      generateToken(newUser._id, res);
      await newUser.save();
      res.status(201).send(newUser);
    } else {
      res.status(400).send("Invalid User data");
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
      return res.status(400).send("Invalid credentials");
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).send("Invalid credentials");
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
    res.status(200).send("Logged out successfully");
  } catch (error) {
    console.log("Error in logout", error.message);
    res.status(500).send("Server Error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id;

    if (!profilePic) {
      return res.status(400).send("Profile picture is required");
    }

    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePic: uploadResponse.secure_url,
      },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error in updateUser", error.message);
    res.status(500).send("Server Error");
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
