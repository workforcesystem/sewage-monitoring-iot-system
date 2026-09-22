import SensorReading from "../models/SensorReading.js";
import PatternNote from "../models/PatternNote.js";

// GET READINGS FOR ANALYTICS
//
// Returns a bounded, chronologically-ordered (oldest -> newest) set of
// readings. Chronological order is what the pattern-detection algorithm
// on the client expects; the client can still re-sort for display.
export const getAnalyticsReadings = async (req, res) => {
  try {
    const MAX_LIMIT = 500;

    const limit = Math.min(
      MAX_LIMIT,
      Math.max(1, parseInt(req.query.limit, 10) || MAX_LIMIT)
    );

    const readings = await SensorReading.find()
      .sort({ timestamp: -1 })
      .limit(limit);

    // Flip back to chronological order (oldest first)
    readings.reverse();

    res.status(200).json({ readings });
  } catch (error) {
    console.error("Get analytics readings error:", error);

    res.status(500).json({
      message: "Failed to fetch readings for analytics",
    });
  }
};

// GET ALL PATTERN NOTES
export const getPatternNotes = async (req, res) => {
  try {
    const notes = await PatternNote.find().sort({ startTime: -1 });

    res.status(200).json({ notes });
  } catch (error) {
    console.error("Get pattern notes error:", error);

    res.status(500).json({
      message: "Failed to fetch pattern notes",
    });
  }
};

// CREATE OR UPDATE A NOTE FOR A DETECTED PATTERN
//
// Patterns themselves are computed on the fly on the client and are not
// stored — only the note attached to one is. Upserting on patternKey
// means saving a note for the same pattern twice just updates it.
export const savePatternNote = async (req, res) => {
  try {
    const {
      patternKey,
      direction,
      startReading,
      endReading,
      startTime,
      endTime,
      startLevel,
      endLevel,
      changeAmount,
      note,
    } = req.body;

    if (!patternKey || !direction) {
      return res.status(400).json({
        message: "patternKey and direction are required",
      });
    }

    const update = {
      patternKey,
      direction,
      startTime,
      endTime,
      startLevel,
      endLevel,
      changeAmount,
      note: note || "",
      createdBy: req.user?.id,
    };

    if (startReading) update.startReading = startReading;
    if (endReading) update.endReading = endReading;

    const saved = await PatternNote.findOneAndUpdate(
      { patternKey },
      update,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      message: "Note saved successfully",
      note: saved,
    });
  } catch (error) {
    console.error("Save pattern note error:", error);

    res.status(500).json({
      message: "Failed to save pattern note",
    });
  }
};

// DELETE A PATTERN NOTE
export const deletePatternNote = async (req, res) => {
  try {
    const { patternKey } = req.params;

    await PatternNote.findOneAndDelete({ patternKey });

    res.status(200).json({
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Delete pattern note error:", error);

    res.status(500).json({
      message: "Failed to delete pattern note",
    });
  }
};
