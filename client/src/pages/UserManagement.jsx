import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleCreateAdmin = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response = await api.post(
        "/users/admins",
        formData
      );

      setUsers((previousUsers) => [
        response.data.user,
        ...previousUsers,
      ]);

      setFormData({
        name: "",
        email: "",
        password: "",
      });

      setShowCreateForm(false);
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to create admin"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this Admin?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);

      setUsers((previousUsers) =>
        previousUsers.filter(
          (user) => user._id !== id
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to delete user"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-20">

        <div className="p-6">

          {/* Header */}

          <div className="mb-8 flex items-center justify-between">

            <div>
              <h1 className="text-2xl font-bold">
                User Management
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage administrators of the monitoring system
              </p>
            </div>

            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-medium hover:bg-blue-700"
            >
              <i className="bi bi-person-plus" />
              Add Admin
            </button>

          </div>

          {/* Error */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Users Table */}

          <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">

            <div className="border-b border-gray-800 px-6 py-5">

              <h2 className="font-semibold">
                System Users
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Administrators with access to the system
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-left text-sm">

                <thead className="border-b border-gray-800 bg-gray-950/50">

                  <tr>
                    <th className="px-6 py-4 text-gray-500">
                      Name
                    </th>

                    <th className="px-6 py-4 text-gray-500">
                      Email
                    </th>

                    <th className="px-6 py-4 text-gray-500">
                      Role
                    </th>

                    <th className="px-6 py-4 text-gray-500">
                      Created
                    </th>

                    <th className="px-6 py-4 text-right text-gray-500">
                      Actions
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {loading ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Loading users...
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-gray-800/50"
                      >

                        <td className="px-6 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-medium">
                              {user.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </div>

                            <span className="font-medium">
                              {user.name}
                            </span>

                          </div>

                        </td>

                        <td className="px-6 py-4 text-gray-400">
                          {user.email}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.role === "SuperAdmin"
                                ? "bg-purple-500/10 text-purple-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}
                          >
                            {user.role}
                          </span>

                        </td>

                        <td className="px-6 py-4 text-gray-400">
                          {user.createdAt
                            ? new Date(
                                user.createdAt
                              ).toLocaleDateString()
                            : "--"}
                        </td>

                        <td className="px-6 py-4">

                          <div className="flex justify-end">

                            {user.role !== "SuperAdmin" && (
                              <button
                                onClick={() =>
                                  handleDelete(user._id)
                                }
                                className="rounded-lg bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500/20"
                              >
                                <i className="bi bi-trash" />
                              </button>
                            )}

                          </div>

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

      {/* Create Admin Modal */}

      {showCreateForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">

          <div className="w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6">

            <div className="mb-6">

              <h2 className="text-lg font-semibold">
                Create Admin
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Create a new administrator account.
              </p>

            </div>

            <form onSubmit={handleCreateAdmin}>

              <div className="mb-4">

                <label className="mb-2 block text-sm text-gray-400">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter name"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              <div className="mb-4">

                <label className="mb-2 block text-sm text-gray-400">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="admin@example.com"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              <div className="mb-6">

                <label className="mb-2 block text-sm text-gray-400">
                  Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                  placeholder="Enter password"
                  className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                />

              </div>

              <div className="flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg border border-gray-700 px-4 py-2 text-gray-400 hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700"
                >
                  Create Admin
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
};

export default UserManagement;