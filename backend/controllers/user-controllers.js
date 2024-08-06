import { compareSync, hashSync } from "bcrypt";
import User from "../models/User.js";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import path from "path";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { uploadDir } from "../app.js";
import fs from "fs";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    securityQuestion,
    securityAnswer,
    isAdmin = false,
  } = req.body;

  try {
    // Validate all required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !securityQuestion ||
      !securityAnswer
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if username or email already taken
    const [existingUserByUsername, existingUserByEmail] = await Promise.all([
      User.findOne({ username }),
      User.findOne({ email }),
    ]);

    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    if (existingUserByEmail) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      securityQuestion,
      securityAnswer,
      isAdmin,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "User created successfully",
      token,
      userId: user._id,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    console.error("Error in signup controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  const { identifier, password } = req.body; // Renamed to `identifier` to handle both username and email

  try {
    // Find the user by username or email
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user found with the given username or email." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Respond with user data and token
    res.status(200).json({
      token,
      userId: user._id,
      isAdmin: user.isAdmin,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkUsernameAvailability = async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const user = await User.findOne({ username });
    if (user) {
      return res.json({ isAvailable: false });
    } else {
      return res.json({ isAvailable: true });
    }
  } catch (err) {
    console.error("Error checking username availability:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Request password reset
export const requestReset = async (req, res) => {
  try {
    const { identifier } = req.body; // Change from email to identifier

    if (!identifier) {
      return res.status(400).json({ message: "Username or Email is required" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the security question and user ID
    res.json({
      securityQuestion: user.securityQuestion,
      userId: user._id,
    });
  } catch (error) {
    console.error("Error in requestReset controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Verify the security answer
export const verifySecurityAnswer = async (req, res) => {
  const { identifier, securityAnswer } = req.body;

  try {
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Invalid username or email" });
    }

    const isCorrect = user.securityAnswer === securityAnswer;
    return res.status(200).json({ isCorrect });
  } catch (err) {
    console.error("Error in verifySecurityAnswer controller:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const toggleFavorite = async (req, res) => {
  const userId = req.body.userId;
  const postId = req.body.postId;

  console.log("User ID:", userId);
  console.log("Post ID:", postId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFavorite = user.favorites.includes(postId);
    if (isFavorite) {
      user.favorites.pull(postId); // Remove from favorites
    } else {
      user.favorites.push(postId); // Add to favorites
    }

    await user.save(); // Save the updated user
    console.log("Favorites updated:", user.favorites); // Log updated favorites

    return res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Failed to toggle favorite:", error);
    return res
      .status(500)
      .json({ message: "Failed to toggle favorite", error });
  }
};

//GET ALL USERS
export const getAllUsers = async (req, res) => {
  let users;
  // Communicates with MongoDB
  try {
    users = await User.find();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error" });
  }

  // If users is falsy
  if (!users) {
    return res.status(404).json({ message: "No users found" });
  }

  // If users has a truthy value
  return res.status(200).json({ users });
};

export const getUserById = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId); // Fetch all fields
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user); // Send the entire user object
  } catch (error) {
    console.error("Failed to get user by ID:", error);
    res.status(500).json({ message: "Failed to get user", error });
  }
};

// Delete a user and their posts
export const deleteUser = async (req, res) => {
  const id = req.params.id;
  let session;

  try {
    // Start a session and transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // Find and delete the user
    const user = await User.findByIdAndDelete(id, { session });

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all posts linked to the user
    await Post.deleteMany({ user: id }, { session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with success message
    return res
      .status(200)
      .json({ message: "User and associated posts deleted successfully" });
  } catch (err) {
    if (session) {
      await session.abortTransaction();
      session.endSession();
    }
    console.log(err);
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }
};

export const getFavorites = async (req, res) => {
  const userId = req.params.userId; // Get userId from URL parameter

  try {
    const user = await User.findById(userId).populate("favorites"); // Populate to get post details
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Failed to get favorites:", error);
    return res.status(500).json({ message: "Failed to get favorites", error });
  }
};

export const getUserProfile = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch the user and populate the posts
    const user = await User.findById(userId).populate("posts");
    console.log(`u ${user}`);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = user.posts;
    // if (!posts || posts.length === 0) {
    //   return res.status(404).json({ message: "No posts found for this user" });
    // }

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Failed to get user posts:", error);
    res.status(500).json({ message: "Failed to get user posts", error });
  }
};

export const deleteUserAccount = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const baseUrl = process.env.BASE_URL || "http://localhost:5000";

export const updateUserProfile = async (req, res) => {
  const { userId } = req.params;
  const { bio, username, firstName, lastName } = req.body;
  const profileImage = req.file ? req.file.path : "";
  const profileImageUrl = profileImage
    ? `${baseUrl}/uploads/${path.basename(profileImage)}`
    : "";

  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (bio) user.bio = bio;
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // if (profileImage) user.profileImage = profileImage;
    if (profileImage) user.profileImage = profileImageUrl;

    // if (profileImage) {
    //   user.profileImage = profileImage.replace(/\\/g, "/"); // Normalize path
    // }
    await user.save();

    res.json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user isADMIn
export const updateUserIsAdmin = async (req, res) => {
  const { userId } = req.params;
  const { isAdmin } = req.body;

  try {
    // Find user by ID and update the role
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin },
      { new: true } // Return the updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset the password after forgotten
export const forgotPasswordReset = async (req, res) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  console.log(`Received request to reset password for user ID: ${userId}`);

  try {
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    console.log("Password reset successful");
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// Reset password for logged-in users
export const resetPassword = async (req, res) => {
  const { userId } = req.params;
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found. Invalid username or password" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
