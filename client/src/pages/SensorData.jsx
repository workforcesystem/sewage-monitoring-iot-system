import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const SensorData = () => {
  const [readings, setReadings] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/sensors/recent?page=${page}&limit=${limit}`
      );

      setReadings(response.data.readings);

      setTotalPages(
        response.data.pagination.totalPages
      );

      setTotalRecords(
        response.data.pagination.totalRecords
      );
    } catch (error) {
      console.error("Failed to fetch sensor readings:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load sensor data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, [page]);

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "—";
    }

    return new Date(timestamp).toLocaleString();
  };

  const getStatus = (waterLevel) => {
    if (waterLevel >= 80) {
      return "HIGH";
    }

    if (waterLevel <= 10) {
      return "LOW";
    }

    return "NORMAL";
  };

  const getStatusClass = (status) => {
    if (status === "HIGH") {
      return "bg-red-500/10 text-red-500 dark:text-red-400";
    }

    if (status === "LOW") {
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400";
    }

    return "bg-green-500/10 text-green-600 dark:text-green-400";
  };

  // Shared pagination bar — rendered above the table
  const PaginationBar = () => (
    <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2.5 dark:border-gray-800">

      {/* Previous */}
      <button
        onClick={() =>
          setPage((previousPage) => previousPage - 1)
        }
        disabled={page === 1 || loading}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        <i className="bi bi-chevron-left text-[10px]" />
        Previous
      </button>

      {/* Page Information */}
      <div className="text-xs text-gray-500 dark:text-gray-500">
        Page{" "}
        <span className="font-medium text-gray-900 dark:text-white">
          {page}
        </span>
        {" "}of{" "}
        <span className="font-medium text-gray-900 dark:text-white">
          {totalPages}
        </span>
      </div>

      {/* Next */}
      <button
        onClick={() =>
          setPage((previousPage) => previousPage + 1)
        }
        disabled={
          page === totalPages || loading || totalPages === 0
        }
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
      >
        Next
        <i className="bi bi-chevron-right text-[10px]" />
      </button>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-56 pt-14">

        <div className="p-5">

          {/* Page Header */}

          <div className="mb-6">

            <h1 className="text-lg font-bold">
              Sensor Data
            </h1>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
              View historical water level sensor readings
            </p>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Data Card */}

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

            {/* Card Header */}

            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800">

              <div>

                <h2 className="text-sm font-semibold">
                  Water Level Readings
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
                  {totalRecords} total readings
                </p>

              </div>

              <button
                onClick={fetchReadings}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <i
                  className={`bi bi-arrow-clockwise ${
                    loading ? "animate-spin" : ""
                  }`}
                />

                Refresh
              </button>

            </div>

            {/* Pagination — moved to the top for quicker access */}

            <PaginationBar />

            {/* Table */}

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-200 dark:border-gray-800 text-left text-[11px] uppercase tracking-wider text-gray-400 dark:text-gray-500">

                    <th className="px-4 py-2.5 font-semibold">
                      #
                    </th>

                    <th className="px-4 py-2.5 font-semibold">
                      Time
                    </th>

                    <th className="px-4 py-2.5 font-semibold">
                      Water Level
                    </th>

                    <th className="px-4 py-2.5 font-semibold">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loading ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-500"
                      >
                        <i className="bi bi-arrow-repeat mr-2 animate-spin" />
                        Loading sensor data...
                      </td>

                    </tr>

                  ) : readings.length === 0 ? (

                    <tr>

                      <td
                        colSpan="4"
                        className="px-4 py-8 text-center text-xs text-gray-500 dark:text-gray-500"
                      >
                        No sensor readings found.
                      </td>

                    </tr>

                  ) : (

                    readings.map((reading, index) => {

                      const waterLevel = Number(
                        reading.waterLevel
                      );

                      const status = getStatus(
                        waterLevel
                      );

                      const rowNumber =
                        (page - 1) * limit +
                        index +
                        1;

                      return (
                        <tr
                          key={
                            reading._id ||
                            `${page}-${index}`
                          }
                          className="border-b border-gray-100 dark:border-gray-800/70 transition hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        >

                          <td className="px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500">
                            {rowNumber}
                          </td>

                          <td className="px-4 py-2.5 text-xs text-gray-600 dark:text-gray-300">
                            {formatDate(
                              reading.timestamp
                            )}
                          </td>

                          <td className="px-4 py-2.5">

                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {waterLevel.toFixed(2)}
                            </span>

                            <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">
                              cm
                            </span>

                          </td>

                          <td className="px-4 py-2.5">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>

                          </td>

                        </tr>
                      );
                    })

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

export default SensorData;
