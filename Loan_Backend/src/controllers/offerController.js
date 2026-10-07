import pool from "../config/db.js";

const METHODS = ["Flat", "Reducing"];

const serverError = (res, err) => {
  console.error(err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
};

// Database NUMERIC columns come back as strings ("12.00"). Convert them to numbers
// and use camelCase names for the frontend.
const toOffer = (r) => ({
  id: r.id,
  brokerId: r.broker_id,
  ...(r.broker_name !== undefined && { brokerName: r.broker_name }),
  method: r.method,
  rate: Number(r.rate),
  localInterest: Number(r.local_interest),
  minAmount: Number(r.min_amount),
  maxAmount: Number(r.max_amount),
  minMonths: r.min_months,
  maxMonths: r.max_months,
  isActive: r.is_active,
  createdAt: r.created_at,
});

// POST /api/offers  (broker only)
export const createOffer = async (req, res) => {
  try {
    const { method } = req.body;
    const rate = Number(req.body.rate);
    const minAmount = Number(req.body.minAmount);
    const maxAmount = Number(req.body.maxAmount);
    const minMonths = Number(req.body.minMonths);
    const maxMonths = Number(req.body.maxMonths);
    // Local interest only exists for Flat offers. Reducing offers always get 0.
    const localInterest = method === "Flat" ? Number(req.body.localInterest ?? 0) : 0;

    if (!METHODS.includes(method)) {
      return res.status(400).json({ message: "Method must be Flat or Reducing." });
    }
    if (!(rate > 0 && rate <= 60)) {
      return res.status(400).json({ message: "Rate must be above 0 and up to 60." });
    }
    if (!(localInterest >= 0 && localInterest <= 60)) {
      return res.status(400).json({ message: "Local interest must be between 0 and 60." });
    }
    if (!(minAmount > 0)) {
      return res.status(400).json({ message: "Enter a valid minimum amount." });
    }
    if (!(maxAmount > minAmount)) {
      return res.status(400).json({ message: "Max amount must be greater than min amount." });
    }
    if (!Number.isInteger(minMonths) || minMonths < 1) {
      return res.status(400).json({ message: "Minimum duration must be at least 1 month." });
    }
    if (!Number.isInteger(maxMonths) || maxMonths < minMonths) {
      return res.status(400).json({ message: "Max months cannot be less than min months." });
    }

    // The broker id comes from the login token, never from the request body.
    const { rows } = await pool.query(
      `INSERT INTO offers
         (broker_id, method, rate, local_interest, min_amount, max_amount, min_months, max_months)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, method, rate, localInterest, minAmount, maxAmount, minMonths, maxMonths]
    );

    return res.status(201).json({ offer: toOffer(rows[0]) });
  } catch (err) {
    return serverError(res, err);
  }
};

// GET /api/offers/mine  (broker only): the broker's own offers, newest first
export const getMyOffers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM offers
       WHERE broker_id = $1 AND deleted_at IS NULL
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json({ offers: rows.map(toOffer) });
  } catch (err) {
    return serverError(res, err);
  }
};

// GET /api/offers  (client only): active offers from all brokers, with the broker's name
export const getActiveOffers = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.name AS broker_name
       FROM offers o
       JOIN users u ON u.id = o.broker_id
       WHERE o.is_active = TRUE AND o.deleted_at IS NULL
       ORDER BY o.created_at DESC`
    );
    return res.json({ offers: rows.map(toOffer) });
  } catch (err) {
    return serverError(res, err);
  }
};

// PATCH /api/offers/:id/toggle  (broker only): pause or resume the broker's own offer
export const toggleOffer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Offer not found." });
    }

    // broker_id is part of the condition, so a broker can only change their own offers.
    // A deleted offer cannot be paused or resumed.
    const { rows } = await pool.query(
      `UPDATE offers
       SET is_active = NOT is_active
       WHERE id = $1 AND broker_id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [id, req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Offer not found." });
    }

    return res.json({ offer: toOffer(rows[0]) });
  } catch (err) {
    return serverError(res, err);
  }
};

// DELETE /api/offers/:id  (broker only): soft delete the broker's own offer.
// The row stays in the database (so old loans keep their record), but it
// disappears from every list.
export const deleteOffer = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(404).json({ message: "Offer not found." });
    }

    const { rowCount } = await pool.query(
      `UPDATE offers
       SET deleted_at = NOW(), is_active = FALSE
       WHERE id = $1 AND broker_id = $2 AND deleted_at IS NULL`,
      [id, req.user.id]
    );

    // Not found, not yours, or already deleted: same answer for all three.
    if (!rowCount) {
      return res.status(404).json({ message: "Offer not found." });
    }

    return res.json({ message: "Offer deleted." });
  } catch (err) {
    return serverError(res, err);
  }
};