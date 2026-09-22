import { useEffect, useState } from "react";
// import axios from "axios";
import api from "../services/api";
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

          api.get("/sensors/latest"),
          api.get("/sensors/recent"),
          api.get("/sensors/stats")
          // axios.get("http://localhost:5050/api/sensors/latest", {
          //   withCredentials: true,
          // }),

          // axios.get("http://localhost:5050/api/sensors/recent", {
          //   withCredentials: true,
          // }),

          // axios.get("http://localhost:5050/api/sensors/stats", {
          //   withCredentials: true,
          // }),
        ]);

      // Latest reading
      setLatestReading(latestResponse.data);

      // Recent readings
      //
      // Backend returns:
      // { readings: [...], pagination: {...} }
      //
      // This also safely handles a plain array
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

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);


  useEffect(() => {
  fetchDashboardData();

  const interval = setInterval(() => {
    fetchDashboardData();
  }, 3500);

  return () => clearInterval(interval);
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
        return "text-red-500 dark:text-red-400";

      case "WARNING":
        return "text-yellow-600 dark:text-yellow-400";

      case "NORMAL":
      case "OK":
        return "text-green-600 dark:text-green-400";

      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-[#030712] dark:text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-56 pt-14">
      <div className="p-5">
      {/* -------------------------------- */}
      {/* Header */}
      {/* -------------------------------- */}

      <div className="mb-6">
        <h1 className="text-xl font-bold">
          Dashboard
        </h1>

        <p className="text-gray-500 dark:text-gray-500 mt-0.5 text-sm">
          Welcome back, NMMC
        </p>
      </div>

      {/* -------------------------------- */}
      {/* Error */}
      {/* -------------------------------- */}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {/* -------------------------------- */}
      {/* Stats Cards */}
      {/* -------------------------------- */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">

        {/* Current Water Level */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Current Water Level
              </p>

              <h2 className="text-xl font-bold">
                {loading
                  ? "--"
                  : currentWaterLevel !== undefined &&
                    currentWaterLevel !== null
                  ? currentWaterLevel
                  : "--"}
              </h2>

              <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                centimeters
              </p>
            </div>

            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <i className="bi bi-droplet text-base text-blue-500"></i>
            </div>

          </div>
        </div>

        {/* Plant Status */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Plant Status
              </p>

              <h2
                className={`text-lg font-bold ${getStatusClass(
                  currentStatus
                )}`}
              >
                {loading ? "--" : currentStatus}
              </h2>
            </div>

            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <i className="bi bi-check-circle text-base text-green-500"></i>
            </div>

          </div>
        </div>

        {/* Today's Readings */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Today's Readings
              </p>

              <h2 className="text-xl font-bold">
                {stats.todayReadings}
              </h2>
            </div>

            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <i className="bi bi-activity text-base text-purple-500"></i>
            </div>

          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-2">
                Alerts Today
              </p>

              <h2 className="text-xl font-bold">
                {totalAlerts}
              </h2>
            </div>

            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <i className="bi bi-exclamation-triangle text-base text-orange-500"></i>
            </div>

          </div>
        </div>

      </div>

      {/* -------------------------------- */}
      {/* Water Level Chart */}
      {/* -------------------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 dark:bg-[#111827] dark:border-gray-800">

        <div className="mb-4">
          <h2 className="text-base font-bold">
            Water Level
          </h2>

          <p className="text-gray-500 dark:text-gray-500 text-xs">
            Latest sensor readings
          </p>
        </div>

        <div className="h-[260px]">

          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-400 dark:text-gray-600 text-sm">
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
                  stroke="#e5e7eb"
                  className="dark:opacity-30"
                />

                <XAxis
                  dataKey="time"
                  stroke="#9ca3af"
                  fontSize={11}
                />

                <YAxis
                  stroke="#9ca3af"
                  fontSize={11}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#111827",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="waterLevel"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5 }}
                />

              </LineChart>
            </ResponsiveContainer>
          )}

        </div>
      </div>

      {/* -------------------------------- */}
      {/* Recent Readings */}
      {/* -------------------------------- */}

      <div className="bg-white border border-gray-200 rounded-xl p-4 dark:bg-[#111827] dark:border-gray-800">

        <div className="mb-4">
          <h2 className="text-base font-bold">
            Recent Readings
          </h2>

          <p className="text-gray-500 dark:text-gray-500 text-xs">
            Latest sensor measurements
          </p>
        </div>

        {recentReadings.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-400 dark:text-gray-600 text-sm">
              No sensor readings available
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-left">

                  <th className="py-2 px-3 text-gray-500 dark:text-gray-500 text-xs font-medium">
                    Time
                  </th>

                  <th className="py-2 px-3 text-gray-500 dark:text-gray-500 text-xs font-medium">
                    Water Level
                  </th>

                  <th className="py-2 px-3 text-gray-500 dark:text-gray-500 text-xs font-medium">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {recentReadings.map((reading) => (
                  <tr
                    key={reading._id}
                    className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >

                    <td className="py-2.5 px-3 text-gray-600 dark:text-gray-300 text-sm">
                      {reading.timestamp
                        ? new Date(
                            reading.timestamp
                          ).toLocaleString()
                        : "--"}
                    </td>

                    <td className="py-2.5 px-3 text-gray-900 dark:text-white font-medium text-sm">
                      {reading.waterLevel ?? "--"} cm
                    </td>

                    <td className="py-2.5 px-3">
                      <span
                        className={`font-medium text-sm ${getStatusClass(
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
      </div>

      </main>

    </div>
  );
};

export default Dashboard;
