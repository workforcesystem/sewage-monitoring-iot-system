import mongoose from "mongoose";

const patternNoteSchema = new mongoose.Schema(
  {
    // Stable identifier derived from the first + last reading in the
    // detected run (see client-side pattern detection). Using the
    // reading ids means the same pattern always maps to the same note,
    // even across reloads, without us having to persist patterns
    // themselves.
    patternKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    direction: {
      type: String,
      enum: ["RISE", "DROP"],
      required: true,
    },

    startReading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorReading",
    },

    endReading: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SensorReading",
    },

    startTime: Date,
    endTime: Date,

    startLevel: Number,
    endLevel: Number,
    changeAmount: Number,

    note: {
      type: String,
      default: "",
      maxlength: 2000,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const PatternNote = mongoose.model("PatternNote", patternNoteSchema);

export default PatternNote;
