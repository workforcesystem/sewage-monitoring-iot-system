import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [latestReading, setLatestReading] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);

  const [stats, setStats] = useState({
    todayReadings: 0,
    criticalCount: 0,
    warningCount: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [latestResponse, recentResponse, statsResponse] =
        await Promise.all([
          axios.get("http://localhost:5050/api/sensors/latest", {
            withCredentials: true,
          }),

          axios.get("http://localhost:5050/api/sensors/recent", {
            withCredentials: true,
          }),

          axios.get("http://localhost:5050/api/sensors/stats", {
            withCredentials: true,
          }),
        ]);

      // Latest reading
      setLatestReading(latestResponse.data);

      // Recent readings
      //
      // Backend should now return:
      // [
      //   {...},
      //   {...},
      //   {...}
      // ]
      //
      // This also safely handles { readings: [...] }
      // in case an old backend response is still running.
      const readings = Array.isArray(recentResponse.data)
        ? recentResponse.data
        : Array.isArray(recentResponse.data.readings)
        ? recentResponse.data.readings
        : [];

      setRecentReadings(readings);

      // Statistics
      setStats({
        todayReadings: statsResponse.data?.todayReadings || 0,
        criticalCount: statsResponse.data?.criticalCount || 0,
        warningCount: statsResponse.data?.warningCount || 0,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data"
      );

      // Keep dashboard usable even if API fails
      setLatestReading(null);
      setRecentReadings([]);

      setStats({
        todayReadings: 0,
        criticalCount: 0,
        warningCount: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // --------------------------------
  // Chart data
  // --------------------------------

  const chartData = [...recentReadings]
    .reverse()
    .map((reading) => ({
      time: new Date(reading.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      waterLevel: Number(reading.waterLevel) || 0,
    }));

  // --------------------------------
  // Current values
  // --------------------------------

  const currentWaterLevel = latestReading?.waterLevel;

  const currentStatus = latestReading?.status || "--";

  const totalAlerts =
    Number(stats.criticalCount || 0) +
    Number(stats.warningCount || 0);

  // --------------------------------
  // Status helper
  // --------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case "CRITICAL":
        return "text-red-400";

      case "WARNING":
        return "text-yellow-400";

      case "NORMAL":
      case "OK":
        return "text-green-400";

      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-20 p-6">
      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back, NMMC
        </p>
      </div>

      {/* -------------------------------- */}
      {/* Error */}
      {/* -------------------------------- */}

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {/* -------------------------------- */}
      {/* Stats Cards */}
      {/* -------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {/* Current Water Level */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 text-sm mb-3">
                Current Water Level
              </p>

              <h2 className="text-3xl font-bold">
                {loading
                  ? "--"
                  : currentWaterLevel !== undefined &&
                    currentWaterLevel !== null
                  ? currentWaterLevel
                  : "--"}
              </h2>

              <p className="text-gray-500 text-sm mt-3">
                centimeters
              </p>
            </div>

            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <i className="bi bi-droplet text-2xl text-blue-500"></i>
            </div>

          </div>
        </div>

        {/* Plant Status */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 text-sm mb-3">
                Plant Status
              </p>

              <h2
                className={`text-2xl font-bold ${getStatusClass(
                  currentStatus
                )}`}
              >
                {loading ? "--" : currentStatus}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
              <i className="bi bi-check-circle text-2xl text-green-500"></i>
            </div>

          </div>
        </div>

        {/* Today's Readings */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 text-sm mb-3">
                Today's Readings
              </p>

              <h2 className="text-3xl font-bold">
                {stats.todayReadings}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <i className="bi bi-activity text-2xl text-purple-500"></i>
            </div>

          </div>
        </div>

        {/* Alerts */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 text-sm mb-3">
                Alerts Today
              </p>

              <h2 className="text-3xl font-bold">
                {totalAlerts}
              </h2>
            </div>

            <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-2xl text-orange-500"></i>
            </div>

          </div>
        </div>

      </div>

      {/* -------------------------------- */}
      {/* Water Level Chart */}
      {/* -------------------------------- */}

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6 mb-6">

        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Water Level
          </h2>

          <p className="text-gray-500 text-sm">
            Latest sensor readings
          </p>
        </div>

        <div className="h-[350px]">

          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-600">
                No sensor data available
              </p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart data={chartData}>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1f2937"
                />

                <XAxis
                  dataKey="time"
                  stroke="#6b7280"
                />

                <YAxis
                  stroke="#6b7280"
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6 }}
                />

              </LineChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>

      {/* -------------------------------- */}
      {/* Recent Readings */}
      {/* -------------------------------- */}

      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">

        <div className="mb-6">
          <h2 className="text-xl font-bold">
            Recent Readings
          </h2>

          <p className="text-gray-500 text-sm">
            Latest sensor measurements
          </p>
        </div>

        {recentReadings.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-600">
              No sensor readings available
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-800 text-left">

                  <th className="py-3 px-4 text-gray-500 text-sm font-medium">
                    Time
                  </th>

                  <th className="py-3 px-4 text-gray-500 text-sm font-medium">
                    Water Level
                  </th>

                  <th className="py-3 px-4 text-gray-500 text-sm font-medium">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentReadings.map((reading) => (
                  <tr
                    key={reading._id}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30"
                  >

                    <td className="py-4 px-4 text-gray-300">
                      {reading.timestamp
                        ? new Date(
                            reading.timestamp
                          ).toLocaleString()
                        : "--"}
                    </td>

                    <td className="py-4 px-4 text-white font-medium">
                      {reading.waterLevel ?? "--"} cm
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`font-medium ${getStatusClass(
                          reading.status
                        )}`}
                      >
                        {reading.status || "--"}
                      </span>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

      </main>

    </div>
  );
};

export default Dashboard;