import express from "express";

import {
  getAnalyticsReadings,
  getPatternNotes,
  savePatternNote,
  deletePatternNote,
} from "../controllers/analyticsController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/readings",
  protect,
  getAnalyticsReadings
);

router.get(
  "/notes",
  protect,
  getPatternNotes
);

router.post(
  "/notes",
  protect,
  savePatternNote
);

router.delete(
  "/notes/:patternKey",
  protect,
  deletePatternNote
);

export default router;
