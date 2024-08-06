// post-routes.js
import { Router } from "express";
import path from "path";
import multer from "multer";

import {
  addPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
} from "../controllers/post-controllers.js";

// Multer setup for multiple file uploads
const storageMultiple = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const uploadMultiple = multer({ storage: storageMultiple }).array("images", 3); // Limit to 3 files

const postRouter = Router();

// Define routes
postRouter.get("/", getAllPosts);
postRouter.get("/:id", getPostById);
postRouter.post("/addPost", uploadMultiple, addPost); // Use multer middleware to handle multiple file uploads
postRouter.put(
  "/:id",
  multer({ storage: storageMultiple }).single("image"),
  updatePost
); // Handle single file upload for updates if needed
postRouter.delete("/:id", deletePost);

export default postRouter;
