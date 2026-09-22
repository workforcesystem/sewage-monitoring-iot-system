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
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-gray-800 bg-gray-900 text-white">

      {/* Logo */}
      <div className="flex h-20 items-center border-b border-gray-800 px-6">
        <div>
          <h1 className="text-lg font-bold">
            Sewage Monitor
          </h1>

          <p className="text-xs text-gray-500">
            Monitoring System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Main Menu
        </p>

        <div className="space-y-1">

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`
              }
            >
              <i className={`bi ${item.icon} text-lg`} />

              <span>{item.name}</span>
            </NavLink>
          ))}

        </div>
      </nav>

      {/* Bottom */}
      <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">

        <div className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600">
            <i className="bi bi-person" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {user?.name}
            </p>

            <p className="text-xs text-gray-500">
              {user?.role}
            </p>
          </div>

        </div>

      </div>

    </aside>
  );
};

export default Sidebar;