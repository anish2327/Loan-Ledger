import "dotenv/config";
import express from "express";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/offers", offerRoutes);

// Health check: confirms the server and the database are connected
app.get("/api/health", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT NOW() AS time");
    res.json({ status: "ok", dbTime: rows[0].time });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});