import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "bi-speedometer2",
    },
    {
      name: "Sensor Data",
      path: "/sensor-data",
      icon: "bi-activity",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "bi-bar-chart-line",
    },
  ];

if (user?.role === "SuperAdmin") {
  menuItems.push({
    name: "User Management",
    path: "/user-management",
    icon: "bi-people",
  });
}

  menuItems.push({
    name: "Settings",
    path: "/settings",
    icon: "bi-gear",
  });

  return (
    <aside className="fixed left-0 top-0 h-screen w-56 border-r border-gray-200 bg-white text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-white">

      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-5 dark:border-gray-800">
        <div>
          <h1 className="text-sm font-bold">
            Sewage Monitor
          </h1>

          <p className="text-[11px] text-gray-500 dark:text-gray-500">
            Monitoring System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3">

        <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
          Main Menu
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                }`
              }
            >
              <i className={`bi ${item.icon} text-sm`} />

              <span>{item.name}</span>
            </NavLink>
          ))}

        </div>
      </nav>

      {/* Bottom */}
      <div className="absolute bottom-0 w-full border-t border-gray-200 p-3 dark:border-gray-800">

        <div className="flex items-center gap-2.5 rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">

          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600">
            <i className="bi bi-person text-xs text-white" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium">
              {user?.name}
            </p>

            <p className="text-[11px] text-gray-500 dark:text-gray-500">
              {user?.role}
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;
