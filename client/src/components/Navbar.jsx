import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed left-64 right-0 top-0 z-20 h-20 border-b border-gray-800 bg-gray-950 px-6">

      <div className="flex h-full items-center justify-between">

        {/* Search */}
        <div className="relative w-96">

          <i className="bi bi-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-600"
          />

        </div>

        {/* Right section */}
        <div className="flex items-center gap-5">

          <button className="relative text-gray-400 hover:text-white">
            <i className="bi bi-bell text-xl" />

            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>

          {/* Profile */}
          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-900"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="text-left">
                <p className="text-sm font-medium text-white">
                  {user?.name}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.role}
                </p>
              </div>

              <i className="bi bi-chevron-down text-xs text-gray-500" />

            </button>

            {profileOpen && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-xl border border-gray-800 bg-gray-900 shadow-xl">

                <div className="border-b border-gray-800 px-4 py-3">
                  <p className="text-sm font-medium text-white">
                    {user?.name}
                  </p>

                  <p className="mt-1 truncate text-xs text-gray-500">
                    {user?.email}
                  </p>
                </div>

                <div className="p-2">

                  <button
                    onClick={() => navigate("/profile")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <i className="bi bi-person" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <i className="bi bi-gear" />
                    Settings
                  </button>

                  <div className="my-2 border-t border-gray-800" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/40"
                  >
                    <i className="bi bi-box-arrow-right" />
                    Logout
                  </button>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </header>
  );
};

export default Navbar;