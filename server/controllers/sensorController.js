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


// GET SENSOR READINGS (paginated, max 10 per page)
export const getRecentReadings = async (req, res) => {
  try {
    const MAX_LIMIT = 10;

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);

    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || MAX_LIMIT)
    );

    const skip = (page - 1) * limit;

    const [readings, totalRecords] = await Promise.all([
      SensorReading.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),

      SensorReading.countDocuments(),
    ]);

    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

    res.status(200).json({
      readings,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
      },
    });
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