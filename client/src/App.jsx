import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import Placeholder from "./pages/Placeholder";

import ProtectedRoute from "./components/ProtectedRoute";

import SensorData from "./pages/SensorData";

import UserManagement from "./pages/UserManagement";
import SuperAdminRoute from "./components/SuperAdminRoute";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/sensor-data"
  element={
    <ProtectedRoute>
      <SensorData title="Sensor Data"/>
    </ProtectedRoute>
  }
/>

<Route
  path="/user-management"
  element={
    <SuperAdminRoute>
      <UserManagement title="User Management"/>
    </SuperAdminRoute>
  }
/>

<Route
  path="/profile"
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  }
/>

        {/* <Route
          path="/sensors"
          element={
            <ProtectedRoute>
              <Placeholder title="Sensor Data" />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Placeholder title="Analytics" />
            </ProtectedRoute>
          }
        />

        {/* <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Placeholder title="User Management" />
            </ProtectedRoute>
          }
        /> */}

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Placeholder title="Settings" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Placeholder title="Edit Profile" />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  );
};

export default App;