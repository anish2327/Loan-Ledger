import { Router } from "express";
import { signup, login, googleAuth, me, logout } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Public routes (user is not logged in yet)
router.post("/signup", signup);
router.post("/login", login);
router.post("/google", googleAuth);

// Protected routes (valid token required)
router.get("/me", protect, me);
router.post("/logout", protect, logout);

export default router;