import { Router } from "express";
import {
  createOffer,
  getMyOffers,
  getActiveOffers,
  toggleOffer,
  deleteOffer,
} from "../controllers/offerController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = Router();

// Every route needs a login (protect first), then a role check (restrictTo).

// Broker routes
router.post("/", protect, restrictTo("broker"), createOffer);
router.get("/mine", protect, restrictTo("broker"), getMyOffers);
router.patch("/:id/toggle", protect, restrictTo("broker"), toggleOffer);
router.delete("/:id", protect, restrictTo("broker"), deleteOffer);

// Client route
router.get("/", protect, restrictTo("client"), getActiveOffers);

export default router;