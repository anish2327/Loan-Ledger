import { verifyToken } from "../utils/token.js";

// Checks that the request has a valid login token.
export const protect = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please log in to continue." });
  }

  try {
    const token = header.split(" ")[1];
    req.user = verifyToken(token); // { id, role }
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please log in again." });
  }
};

// Allows only the given role (use it after protect).
export const restrictTo = (role) => (req, res, next) => {
  if (req.user.role !== role) {
    return res.status(403).json({
      message: `Only ${role}s can do this.`,
    });
  }
  next();
};