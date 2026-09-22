import mongoose from "mongoose";

const sensorReadingSchema = new mongoose.Schema(
  {
    waterLevel: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["NORMAL", "WARNING", "CRITICAL"],
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const SensorReading = mongoose.model(
  "SensorReading",
  sensorReadingSchema
);

export default SensorReading;