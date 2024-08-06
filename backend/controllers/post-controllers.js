import mongoose from "mongoose";
import Post from "../models/Post.js";
import User from "../models/User.js";
import path from "path";

//get all posts
export const getAllPosts = async (req, res, next) => {
  let posts;
  try {
    posts = await Post.find();
  } catch (err) {
    return console.log(err);
  }

  if (!posts) {
    res.status(500).json({ message: "Unexpected Error occured" });
  }

  return res.status(200).json({ posts });
};

//get post by id
export const getPostById = async (req, res) => {
  const id = req.params.id;

  let post;
  try {
    post = await Post.findById(id);
  } catch (err) {
    return console.log(err);
  }
  if (!post) {
    res.status(404).json({ message: "No Post Found" });
  }

  return res.status(200).json({ post });
};

// Define the base URL
const baseUrl = process.env.BASE_URL || "http://localhost:5000";

export const addPost = async (req, res, next) => {
  const { subLocation, description, location, date, user, locationUrl } =
    req.body;
  const imageFiles = req.files; // assuming you are using multer or a similar middleware

  // Generate image URLs
  const imageUrls = imageFiles.map(
    (file) => `${baseUrl}/uploads/${path.basename(file.path)}`
  );

  let post;
  try {
    post = new Post({
      subLocation,
      description,
      location,
      date: new Date(date),
      user,
      images: imageUrls.map((url) => ({ url })), // Transform image URLs into the required format
      locationUrl,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    const existingUser = await User.findById(user);
    existingUser.posts.push(post);
    await existingUser.save({ session });
    post = await post.save({ session });
    await session.commitTransaction();
    session.endSession();
  } catch (err) {
    return console.log(err);
  }

  if (!post) {
    return res.status(500).json({ message: "Unexpected Error Occurred" });
  }

  return res.status(201).json({ post });
};

export const deletePost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updatePost = async (req, res) => {
  const id = req.params.id;
  const { subLocation, description, location, locationUrl } = req.body;
  const image = req.file ? req.file.path : undefined;

  console.log("Received update request with data:", {
    id,
    subLocation,
    description,
    location,
    locationUrl,
    image,
  });

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        subLocation,
        description,
        location,
        locationUrl,
        ...(image && { image: { url: image } }),
      },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post: updatedPost });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
