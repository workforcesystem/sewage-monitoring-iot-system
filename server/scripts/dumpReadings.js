import dotenv from "dotenv";
import connectDB from "../config/db.js";
import SensorReading from "../models/SensorReading.js";

dotenv.config();

const TOTAL_READINGS = 106000;

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

const generateReadings = () => {
  const readings = [];

  for (let i = 0; i < TOTAL_READINGS; i++) {
    const waterLevel = generateWaterLevel();

    readings.push({
      waterLevel,
      status: getStatus(waterLevel),
      timestamp: new Date(),
    });
  }

  return readings;
};

const dumpReadings = async () => {
  try {
    await connectDB();

    console.log(`Generating ${TOTAL_READINGS} sensor readings...`);

    const readings = generateReadings();

    await SensorReading.insertMany(readings);

    console.log(
      `Successfully inserted ${TOTAL_READINGS} sensor readings.`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to dump sensor readings:", error);
    process.exit(1);
  }
};

dumpReadings();