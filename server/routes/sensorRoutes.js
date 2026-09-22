import express from "express";

import {
  getLatestReading,
  getRecentReadings,
  getSensorStats,
  updateSensorReading,
  deleteSensorReading,
} from "../controllers/sensorController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/latest",
  protect,
  getLatestReading
);

router.get(
  "/recent",
  protect,
  getRecentReadings
);

router.get(
  "/stats",
  protect,
  getSensorStats
);

router.put(
  "/:id",
  protect,
  updateSensorReading
);

router.delete(
  "/:id",
  protect,
  deleteSensorReading
);

export default router;