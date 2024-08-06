// backend/middleware/auth.js
import jwt from "jsonwebtoken";
import jwtDecode from "jwt-decode";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Authorization failed: No token provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = {
      userId: decodedToken.userId,
      isAdmin: decodedToken.isAdmin,
    };
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Authorization failed: Invalid token" });
  }
};

// Middleware to verify JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token"); // Adjust based on where you store the token
  if (!token) return null;

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken.userId; // Adjust based on your token structure
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};
