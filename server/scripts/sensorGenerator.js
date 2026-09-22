import dotenv from "dotenv";

import connectDB from "../config/db.js";
import SensorReading from "../models/SensorReading.js";

dotenv.config();

const generateWaterLevel = () => {
  return Number((Math.random() * 100).toFixed(2));
};

const getStatus = (waterLevel) => {
  if (waterLevel >= 85) {
    return "CRITICAL";
  }

  if (waterLevel >= 70) {
    return "WARNING";
  }

  return "NORMAL";
};

const generateReading = async () => {
  try {
    const waterLevel = generateWaterLevel();
    const status = getStatus(waterLevel);

    const reading = await SensorReading.create({
      waterLevel,
      status,
    });

    console.log(
      `[${reading.timestamp.toLocaleTimeString()}] Water Level: ${waterLevel} cm | Status: ${status}`
    );
  } catch (error) {
    console.error(
      "Failed to generate sensor reading:",
      error.message
    );
  }
};

const startGenerator = async () => {
  await connectDB();

  console.log("Sensor generator started");

  // Generate the first reading immediately
  await generateReading();

  // Generate a new reading every 5 seconds
  setInterval(generateReading, 5000);
};

startGenerator();