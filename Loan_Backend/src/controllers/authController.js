import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { generateToken } from "../utils/token.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const ROLES = ["client", "broker"];
const roleLabel = (role) => (role === "client" ? "Client" : "Broker");

// Only these fields are ever sent to the frontend (never password_hash).
const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
  picture: u.picture,
});

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
};

// POST /api/auth/signup
export const signup = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Role must be client or broker." });
    }
    if (name.trim().length < 3) {
      return res.status(400).json({ message: "Name must be at least 3 characters long." });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ message: "Enter a valid 10-digit mobile number." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [cleanEmail]);
    if (existing.rows.length) {
      return res.status(409).json({ message: "This email is already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role, picture`,
      [name.trim(), cleanEmail, phone, passwordHash, role]
    );

    const user = rows[0];
    return res.status(201).json({ user, token: generateToken(user) });
  } catch (err) {
    // 23505 = unique violation (two signups with the same email at the same time)
    if (err.code === "23505") {
      return res.status(409).json({ message: "This email is already registered." });
    }
    return serverError(res, err);
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required." });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Role must be client or broker." });
    }

    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim().toLowerCase(),
    ]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Account created with Google has no password
    if (!user.password_hash) {
      return res
        .status(400)
        .json({ message: "This account uses Google sign-in. Please continue with Google." });
    }

    const passwordOk = await bcrypt.compare(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Role check comes after the password check, so the role is never revealed to someone without the password.
    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as a ${roleLabel(user.role)}. Please log in as ${roleLabel(user.role)}.`,
      });
    }

    return res.json({ user: publicUser(user), token: generateToken(user) });
  } catch (err) {
    return serverError(res, err);
  }
};

// GET /api/auth/me  (route will use the protect middleware)
export const me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, phone, role, picture FROM users WHERE id = $1",
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({ user: rows[0] });
  } catch (err) {
    return serverError(res, err);
  }
};

// POST /api/auth/logout
// The token itself is removed by the frontend. This route just confirms the logout.
export const logout = (req, res) => {
  return res.json({ message: "Logged out successfully." });
};

// POST /api/auth/google
// Works for both the login page and the signup page.
// Body: { credential, role }  (credential = Google ID token from the frontend)
export const googleAuth = async (req, res) => {
  try {
    const { credential, role } = req.body;

    if (!credential || !role) {
      return res.status(400).json({ message: "Google credential and role are required." });
    }
    if (!ROLES.includes(role)) {
      return res.status(400).json({ message: "Role must be client or broker." });
    }

    // Verify the token with Google. This proves the email really belongs to this person.
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch {
      return res.status(401).json({ message: "Google sign-in failed. Please try again." });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ message: "Your Google email is not verified." });
    }

    const email = payload.email.toLowerCase();
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    let user = rows[0];

    // No account yet: create one from the Google details
    if (!user) {
      const name = (payload.name || email.split("@")[0]).slice(0, 100);

      const created = await pool.query(
        `INSERT INTO users (name, email, google_id, picture, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [name, email, payload.sub, payload.picture || null, role]
      );

      user = created.rows[0];
      return res.status(201).json({ user: publicUser(user), token: generateToken(user) });
    }

    // Account exists: the role chosen on the page must match
    if (user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as a ${roleLabel(user.role)}. Please log in as ${roleLabel(user.role)}.`,
      });
    }

    // The email is linked to a different Google account
    if (user.google_id && user.google_id !== payload.sub) {
      return res.status(403).json({ message: "This email is linked to a different Google account." });
    }

    // Account was created with email and password: link Google to it
    if (!user.google_id) {
      const updated = await pool.query(
        `UPDATE users
         SET google_id = $1, picture = COALESCE(picture, $2)
         WHERE id = $3
         RETURNING *`,
        [payload.sub, payload.picture || null, user.id]
      );
      user = updated.rows[0];
    }

    return res.json({ user: publicUser(user), token: generateToken(user) });
  } catch (err) {
    return serverError(res, err);
  }
};