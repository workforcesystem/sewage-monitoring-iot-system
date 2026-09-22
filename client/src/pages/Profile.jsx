import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const Profile = () => {
  const { user, setUser } = useAuth();

  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleEdit = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setMessage("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });

    setMessage("");
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put("/users/profile", formData);

      const updatedUser = response.data.user;

      setUser(updatedUser);

      setFormData({
        name: updatedUser.name,
        email: updatedUser.email,
      });

      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error(error);

      setError(
        error.response?.data?.message ||
          "Failed to update profile."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-56 pt-14">

        <div className="p-5">

          {/* Header */}

          <div className="mb-6">
            <h1 className="text-lg font-bold">
              My Profile
            </h1>

            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-500">
              View and manage your account information
            </p>
          </div>

          {/* Success Message */}

          {message && (
            <div className="mb-4 max-w-xl rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-xs text-green-600 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400">
              {message}
            </div>
          )}

          {/* Error Message */}

          {error && (
            <div className="mb-4 max-w-xl rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Profile Card */}

          <div className="max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">

            {/* Profile Header */}

            <div className="flex items-center gap-4 border-b border-gray-200 p-4 dark:border-gray-800">

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h2 className="text-base font-semibold">
                  {user?.name}
                </h2>

                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {user?.email}
                </p>

                <span className="mt-1.5 inline-block rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
                  {user?.role}
                </span>
              </div>

            </div>

            {/* Account Information */}

            <div className="p-4">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-sm font-semibold">
                  Account Information
                </h3>

                {!editing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    <i className="bi bi-pencil" />
                    Edit Profile
                  </button>
                )}

              </div>

              {!editing ? (

                /* VIEW MODE */

                <div className="space-y-4">

                  <div>
                    <p className="mb-0.5 text-[11px] text-gray-500 dark:text-gray-500">
                      Full Name
                    </p>

                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-0.5 text-[11px] text-gray-500 dark:text-gray-500">
                      Email Address
                    </p>

                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-0.5 text-[11px] text-gray-500 dark:text-gray-500">
                      Account Role
                    </p>

                    <p className="text-sm text-gray-900 dark:text-white">
                      {user?.role || "—"}
                    </p>
                  </div>

                </div>

              ) : (

                /* EDIT MODE */

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >

                  {/* Name */}

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />

                  </div>

                  {/* Email */}

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                    />

                  </div>

                  {/* Role */}

                  <div>

                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
                      Account Role
                    </label>

                    <input
                      type="text"
                      value={user?.role || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-500"
                    />

                    <p className="mt-1.5 text-[11px] text-gray-400 dark:text-gray-600">
                      Your account role cannot be changed from this page.
                    </p>

                  </div>

                  {/* Buttons */}

                  <div className="flex justify-end gap-2.5 pt-1">

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : "Save Changes"}
                    </button>

                  </div>

                </form>

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Profile;
