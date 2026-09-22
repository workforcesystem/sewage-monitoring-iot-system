import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SuperAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until authentication check is complete
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950 dark:text-white">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Checking authentication...
        </div>
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is logged in but isn't a SuperAdmin
  if (user.role !== "SuperAdmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default SuperAdminRoute;