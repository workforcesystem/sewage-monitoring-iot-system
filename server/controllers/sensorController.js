import SensorReading from "../models/SensorReading.js";


// GET LATEST READING
export const getLatestReading = async (req, res) => {
  try {
    const reading = await SensorReading.findOne()
      .sort({ timestamp: -1 });

    res.status(200).json(reading);
  } catch (error) {
    console.error("Get latest reading error:", error);

    res.status(500).json({
      message: "Failed to fetch latest sensor reading",
    });
  }
};


// GET ALL SENSOR READINGS
export const getRecentReadings = async (req, res) => {
  try {
    const readings = await SensorReading.find()
      .sort({ timestamp: -1 });

    res.status(200).json(readings);
  } catch (error) {
    console.error("Get sensor readings error:", error);

    res.status(500).json({
      message: "Failed to fetch sensor readings",
    });
  }
};


// GET SENSOR STATISTICS
export const getSensorStats = async (req, res) => {
  try {
    const startOfDay = new Date();

    startOfDay.setHours(0, 0, 0, 0);

    const todayReadings = await SensorReading.countDocuments({
      timestamp: {
        $gte: startOfDay,
      },
    });

    const criticalCount = await SensorReading.countDocuments({
      status: "CRITICAL",
      timestamp: {
        $gte: startOfDay,
      },
    });

    const warningCount = await SensorReading.countDocuments({
      status: "WARNING",
      timestamp: {
        $gte: startOfDay,
      },
    });

    res.status(200).json({
      todayReadings,
      criticalCount,
      warningCount,
    });
  } catch (error) {
    console.error("Get sensor stats error:", error);

    res.status(500).json({
      message: "Failed to fetch sensor statistics",
    });
  }
};


// UPDATE SENSOR READING
export const updateSensorReading = async (req, res) => {
  try {
    const { id } = req.params;
    const { waterLevel, status } = req.body;

    const reading = await SensorReading.findById(id);

    if (!reading) {
      return res.status(404).json({
        message: "Sensor reading not found",
      });
    }

    if (waterLevel !== undefined) {
      reading.waterLevel = Number(waterLevel);
    }

    if (status !== undefined) {
      reading.status = status;
    }

    await reading.save();

    res.status(200).json({
      message: "Sensor reading updated successfully",
      reading,
    });
  } catch (error) {
    console.error("Update sensor reading error:", error);

    res.status(500).json({
      message: "Failed to update sensor reading",
    });
  }
};


// DELETE SENSOR READING
export const deleteSensorReading = async (req, res) => {
  try {
    const { id } = req.params;

    const reading = await SensorReading.findById(id);

    if (!reading) {
      return res.status(404).json({
        message: "Sensor reading not found",
      });
    }

    await SensorReading.findByIdAndDelete(id);

    res.status(200).json({
      message: "Sensor reading deleted successfully",
    });
  } catch (error) {
    console.error("Delete sensor reading error:", error);

    res.status(500).json({
      message: "Failed to delete sensor reading",
    });
  }
};