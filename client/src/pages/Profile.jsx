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
    <div className="min-h-screen bg-gray-950 text-white">

      <Sidebar />

      <Navbar />

      <main className="ml-64 pt-20">

        <div className="p-6">

          {/* Header */}

          <div className="mb-8">
            <h1 className="text-2xl font-bold">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage your account information
            </p>
          </div>

          {/* Success Message */}

          {message && (
            <div className="mb-5 max-w-2xl rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {message}
            </div>
          )}

          {/* Error Message */}

          {error && (
            <div className="mb-5 max-w-2xl rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Profile Card */}

          <div className="max-w-2xl overflow-hidden rounded-xl border border-gray-800 bg-gray-900">

            {/* Profile Header */}

            <div className="flex items-center gap-5 border-b border-gray-800 p-6">

              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {user?.name}
                </h2>

                <p className="text-sm text-gray-500">
                  {user?.email}
                </p>

                <span className="mt-2 inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                  {user?.role}
                </span>
              </div>

            </div>

            {/* Account Information */}

            <div className="p-6">

              <div className="mb-5 flex items-center justify-between">

                <h3 className="font-semibold">
                  Account Information
                </h3>

                {!editing && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium transition hover:bg-blue-700"
                  >
                    <i className="bi bi-pencil" />
                    Edit Profile
                  </button>
                )}

              </div>

              {!editing ? (

                /* VIEW MODE */

                <div className="space-y-5">

                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Full Name
                    </p>

                    <p className="text-sm text-white">
                      {user?.name || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Email Address
                    </p>

                    <p className="text-sm text-white">
                      {user?.email || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-xs text-gray-500">
                      Account Role
                    </p>

                    <p className="text-sm text-white">
                      {user?.role || "—"}
                    </p>
                  </div>

                </div>

              ) : (

                /* EDIT MODE */

                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >

                  {/* Name */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />

                  </div>

                  {/* Email */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-700 bg-gray-950 px-4 py-3 text-sm text-white outline-none transition focus:border-blue-500"
                    />

                  </div>

                  {/* Role */}

                  <div>

                    <label className="mb-2 block text-sm font-medium text-gray-400">
                      Account Role
                    </label>

                    <input
                      type="text"
                      value={user?.role || ""}
                      disabled
                      className="w-full cursor-not-allowed rounded-lg border border-gray-800 bg-gray-900 px-4 py-3 text-sm text-gray-500"
                    />

                    <p className="mt-2 text-xs text-gray-600">
                      Your account role cannot be changed from this page.
                    </p>

                  </div>

                  {/* Buttons */}

                  <div className="flex justify-end gap-3 pt-2">

                    <button
                      type="button"
                      onClick={handleCancel}
                      className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
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