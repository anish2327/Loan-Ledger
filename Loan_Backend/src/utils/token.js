import "dotenv/config";
import jwt from "jsonwebtoken";

// Create a token that stays valid for 7 days.
// Only id and role go inside: anyone can decode a token, so no email or password here.
export const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

// Check a token. Returns { id, role } if valid, throws an error if invalid or expired.
export const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);