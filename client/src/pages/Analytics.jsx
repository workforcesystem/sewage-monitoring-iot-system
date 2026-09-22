import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

// --------------------------------------------------------------
// Pattern detection
// --------------------------------------------------------------
//
// Walks the readings in chronological order and groups consecutive
// strictly-rising or strictly-falling runs into "patterns". A run only
// becomes a reported pattern once it clears both the minimum step count
// and the minimum total change — this filters out normal sensor noise
// and keeps only patterns that are worth a human's attention.
//
// Each pattern gets a stable key derived from the first + last reading
// ids in the run, so the same pattern maps to the same note across
// reloads without the server needing to persist patterns themselves.

const SENSITIVITY_PRESETS = {
  high: { minChange: 3, minSteps: 2 },
  medium: { minChange: 6, minSteps: 2 },
  low: { minChange: 10, minSteps: 3 },
};

const detectPatterns = (readings, { minChange, minSteps }) => {
  if (readings.length < 2) {
    return [];
  }

  const patterns = [];

  let runStart = 0;
  let direction = null;

  const closeRun = (endIndex) => {
    if (!direction || endIndex <= runStart) {
      return;
    }

    const startReading = readings[runStart];
    const endReading = readings[endIndex];

    const startLevel = Number(startReading.waterLevel);
    const endLevel = Number(endReading.waterLevel);
    const changeAmount = endLevel - startLevel;
    const steps = endIndex - runStart;

    if (Math.abs(changeAmount) >= minChange && steps >= minSteps) {
      patterns.push({
        patternKey: `${startReading._id}_${endReading._id}`,
        direction,
        startReading,
        endReading,
        startLevel,
        endLevel,
        changeAmount,
        steps,
        startTime: startReading.timestamp,
        endTime: endReading.timestamp,
      });
    }
  };

  for (let i = 1; i < readings.length; i++) {
    const prevLevel = Number(readings[i - 1].waterLevel);
    const curLevel = Number(readings[i].waterLevel);
    const diff = curLevel - prevLevel;

    const stepDirection =
      diff > 0 ? "RISE" : diff < 0 ? "DROP" : null;

    if (direction === null) {
      direction = stepDirection;
      runStart = i - 1;
    } else if (stepDirection !== direction) {
      closeRun(i - 1);
      direction = stepDirection;
      runStart = i - 1;
    }
  }

  closeRun(readings.length - 1);

  // Most recent pattern first
  return patterns.reverse();
};

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
};

const Analytics = () => {
  const [readings, setReadings] = useState([]);
  const [notes, setNotes] = useState({});

  const [sensitivity, setSensitivity] = useState("medium");

  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingKey, setEditingKey] = useState(null);
  const [draftNote, setDraftNote] = useState("");
  const [savingKey, setSavingKey] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [readingsResponse, notesResponse] = await Promise.all([
        api.get("/analytics/readings?limit=300"),
        api.get("/analytics/notes"),
      ]);

      setReadings(readingsResponse.data.readings || []);

      const noteMap = {};

      (notesResponse.data.notes || []).forEach((n) => {
        noteMap[n.patternKey] = n;
      });

      setNotes(noteMap);
    } catch (err) {
      console.error("Failed to load analytics data:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load analytics data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --------------------------------
  // Sorted table data
  // --------------------------------

  const sortedReadings = useMemo(() => {
    const copy = [...readings];

    copy.sort((a, b) => {
      let aVal;
      let bVal;

      if (sortField === "timestamp") {
        aVal = new Date(a.timestamp).getTime();
        bVal = new Date(b.timestamp).getTime();
      } else if (sortField === "waterLevel") {
        aVal = Number(a.waterLevel);
        bVal = Number(b.waterLevel);
      } else {
        aVal = a.status || "";
        bVal = b.status || "";
      }

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return copy;
  }, [readings, sortField, sortDirection]);

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortIcon = (field) => {
    if (field !== sortField) {
      return "bi-arrow-down-up opacity-30";
    }

    return sortDirection === "asc" ? "bi-sort-up" : "bi-sort-down";
  };

  // --------------------------------
  // Patterns
  // --------------------------------

  const patterns = useMemo(
    () => detectPatterns(readings, SENSITIVITY_PRESETS[sensitivity]),
    [readings, sensitivity]
  );

  const risingCount = patterns.filter((p) => p.direction === "RISE").length;
  const droppingCount = patterns.filter((p) => p.direction === "DROP").length;

  // --------------------------------
  // Note editing
  // --------------------------------

  const startEditing = (pattern) => {
    setEditingKey(pattern.patternKey);
    setDraftNote(notes[pattern.patternKey]?.note || "");
  };

  const cancelEditing = () => {
    setEditingKey(null);
    setDraftNote("");
  };

  const saveNote = async (pattern) => {
    try {
      setSavingKey(pattern.patternKey);

      const response = await api.post("/analytics/notes", {
        patternKey: pattern.patternKey,
        direction: pattern.direction,
        startReading: pattern.startReading._id,
        endReading: pattern.endReading._id,
        startTime: pattern.startTime,
        endTime: pattern.endTime,
        startLevel: pattern.startLevel,
        endLevel: pattern.endLevel,
        changeAmount: pattern.changeAmount,
        note: draftNote,
      });

      setNotes((prev) => ({
        ...prev,
        [pattern.patternKey]: response.data.note,
      }));

      setEditingKey(null);
      setDraftNote("");
    } catch (err) {
      console.error("Failed to save note:", err);

      setError(
        err.response?.data?.message || "Failed to save note."
      );
    } finally {
      setSavingKey(null);
    }
  };

  const deleteNote = async (pattern) => {
    try {
      setSavingKey(pattern.patternKey);

      await api.delete(`/analytics/notes/${pattern.patternKey}`);

      setNotes((prev) => {
        const next = { ...prev };
        delete next[pattern.patternKey];
        return next;
      });
    } catch (err) {
      console.error("Failed to delete note:", err);

      setError(
        err.response?.data?.message || "Failed to delete note."
      );
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-56 pt-14">

        <div className="p-5">

          {/* Header */}

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h1 className="text-lg font-bold">
                Analytics
              </h1>

              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                Sort readings and review detected water-level patterns
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500 dark:text-gray-500">
                Pattern sensitivity
              </label>

              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              >
                <option value="high">High (small changes)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (major changes only)</option>
              </select>
            </div>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Summary cards */}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">

            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Rising Patterns
              </p>
              <h2 className="text-xl font-bold text-red-500 dark:text-red-400">
                {loading ? "--" : risingCount}
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Dropping Patterns
              </p>
              <h2 className="text-xl font-bold text-blue-500 dark:text-blue-400">
                {loading ? "--" : droppingCount}
              </h2>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Readings Analyzed
              </p>
              <h2 className="text-xl font-bold">
                {loading ? "--" : readings.length}
              </h2>
            </div>

          </div>

          {/* Detected Patterns */}

          <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 dark:bg-[#111827] dark:border-gray-800">

            <div className="mb-4">
              <h2 className="text-base font-bold">
                Detected Patterns
              </h2>
              <p className="text-gray-500 dark:text-gray-500 text-xs">
                Consecutive rises or drops in water level, with room for your notes
              </p>
            </div>

            {loading ? (
              <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">
                Analyzing readings...
              </p>
            ) : patterns.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400 dark:text-gray-600">
                No significant patterns detected at this sensitivity level.
              </p>
            ) : (
              <div className="space-y-3">

                {patterns.map((pattern) => {
                  const existingNote = notes[pattern.patternKey];
                  const isEditing = editingKey === pattern.patternKey;
                  const isSaving = savingKey === pattern.patternKey;

                  const isRise = pattern.direction === "RISE";

                  return (
                    <div
                      key={pattern.patternKey}
                      className="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
                    >

                      <div className="flex flex-wrap items-start justify-between gap-3">

                        <div className="flex items-start gap-3">

                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isRise
                                ? "bg-red-500/10"
                                : "bg-blue-500/10"
                            }`}
                          >
                            <i
                              className={`bi ${
                                isRise
                                  ? "bi-graph-up-arrow text-red-500 dark:text-red-400"
                                  : "bi-graph-down-arrow text-blue-500 dark:text-blue-400"
                              } text-base`}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-semibold">
                              {isRise ? "Rise" : "Drop"} of{" "}
                              {Math.abs(pattern.changeAmount).toFixed(1)} cm
                              <span className="ml-1.5 font-normal text-gray-500 dark:text-gray-500">
                                ({pattern.steps + 1} readings)
                              </span>
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                              {formatDateTime(pattern.startTime)} → {formatDateTime(pattern.endTime)}
                            </p>

                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                              {pattern.startLevel.toFixed(1)} cm → {pattern.endLevel.toFixed(1)} cm
                            </p>
                          </div>

                        </div>

                        {!isEditing && (
                          <button
                            onClick={() => startEditing(pattern)}
                            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                          >
                            <i className="bi bi-pencil" />
                            {existingNote?.note ? "Edit Note" : "Add Note"}
                          </button>
                        )}

                      </div>

                      {isEditing ? (
                        <div className="mt-3">

                          <textarea
                            value={draftNote}
                            onChange={(e) => setDraftNote(e.target.value)}
                            rows={3}
                            placeholder="What caused this change? Add context for your team..."
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                          />

                          <div className="mt-2 flex justify-end gap-2">
                            <button
                              onClick={cancelEditing}
                              disabled={isSaving}
                              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={() => saveNote(pattern)}
                              disabled={isSaving}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isSaving ? "Saving..." : "Save Note"}
                            </button>
                          </div>

                        </div>
                      ) : existingNote?.note ? (
                        <div className="mt-3 flex items-start justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2.5 dark:bg-gray-950/50">
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {existingNote.note}
                          </p>

                          <button
                            onClick={() => deleteNote(pattern)}
                            disabled={isSaving}
                            title="Delete note"
                            className="shrink-0 text-gray-400 hover:text-red-500 disabled:opacity-50 dark:text-gray-600 dark:hover:text-red-400"
                          >
                            <i className="bi bi-trash text-xs" />
                          </button>
                        </div>
                      ) : null}

                    </div>
                  );
                })}

              </div>
            )}

          </div>

          {/* Sortable Readings Table */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

            <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <h2 className="text-sm font-semibold">
                All Readings
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                Click a column header to sort
              </p>
            </div>

            <div className="max-h-[420px] overflow-y-auto overflow-x-auto">

              <table className="w-full">

                <thead className="sticky top-0 bg-white dark:bg-gray-900">

                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">

                    <th
                      onClick={() => handleSort("timestamp")}
                      className="cursor-pointer select-none px-4 py-2.5 font-semibold hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Time <i className={`bi ${sortIcon("timestamp")} ml-1`} />
                    </th>

                    <th
                      onClick={() => handleSort("waterLevel")}
                      className="cursor-pointer select-none px-4 py-2.5 font-semibold hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Water Level <i className={`bi ${sortIcon("waterLevel")} ml-1`} />
                    </th>

                    <th
                      onClick={() => handleSort("status")}
                      className="cursor-pointer select-none px-4 py-2.5 font-semibold hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Status <i className={`bi ${sortIcon("status")} ml-1`} />
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-500">
                        Loading readings...
                      </td>
                    </tr>
                  ) : sortedReadings.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-500">
                        No readings found.
                      </td>
                    </tr>
                  ) : (
                    sortedReadings.map((reading) => (
                      <tr
                        key={reading._id}
                        className="border-b border-gray-100 dark:border-gray-800/70 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                      >
                        <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                          {formatDateTime(reading.timestamp)}
                        </td>

                        <td className="px-4 py-2.5 text-sm font-medium text-gray-900 dark:text-white">
                          {Number(reading.waterLevel).toFixed(1)} cm
                        </td>

                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              reading.status === "CRITICAL"
                                ? "bg-red-500/10 text-red-500 dark:text-red-400"
                                : reading.status === "WARNING"
                                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                                : "bg-green-500/10 text-green-600 dark:text-green-400"
                            }`}
                          >
                            {reading.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Analytics;
