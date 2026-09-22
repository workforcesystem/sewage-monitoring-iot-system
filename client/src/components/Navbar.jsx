import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="fixed left-56 right-0 top-0 z-20 h-14 border-b border-gray-200 bg-white px-5 dark:border-gray-800 dark:bg-gray-950">

      <div className="flex h-full items-center justify-between">

        {/* Search */}
        <div className="relative w-72">

          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500" />

          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-[13px] text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-600 dark:focus:border-blue-600"
          />

        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">

          <ThemeToggle />

          <button className="relative text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">
            <i className="bi bi-bell text-base" />

            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
          </button>

          {/* Profile */}
          <div className="relative">

            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 rounded-lg px-1.5 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-900"
            >

              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </div>

              <div className="text-left">
                <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>

                <p className="text-[11px] text-gray-500 dark:text-gray-500">
                  {user?.role}
                </p>
              </div>

              <i className="bi bi-chevron-down text-[10px] text-gray-400 dark:text-gray-500" />

            </button>

            {profileOpen && (
              <div className="absolute right-0 top-11 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">

                <div className="border-b border-gray-200 px-3 py-2.5 dark:border-gray-800">
                  <p className="text-[13px] font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-gray-500 dark:text-gray-500">
                    {user?.email}
                  </p>
                </div>

                <div className="p-1.5">

                  <button
                    onClick={() => navigate("/profile")}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <i className="bi bi-person text-sm" />
                    Edit Profile
                  </button>

                  <button
                    onClick={() => navigate("/settings")}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    <i className="bi bi-gear text-sm" />
                    Settings
                  </button>

                  <div className="my-1.5 border-t border-gray-200 dark:border-gray-800" />

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <i className="bi bi-box-arrow-right text-sm" />
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
