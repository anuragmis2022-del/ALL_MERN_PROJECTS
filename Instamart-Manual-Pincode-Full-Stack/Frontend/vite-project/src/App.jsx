import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";

import { addCase } from "./Utils/UserSlice";
import ProtectedRoute from "./Routes/ProtectedRoute";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Pages/Dashboard";
import PriceHistory from "./Pages/PriceHistory";
import MonitoringLogs from "./Pages/MonitoringLogs";
import Login from "./Pages/Login";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_URL = `${API_BASE_URL}/auth`;

axios.defaults.withCredentials = true;

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    axios.get(`${AUTH_URL}/me`)
      .then((response) => {
        dispatch(addCase({ user: response.data.user, loading: false }));
      })
      .catch(() => {
        dispatch(addCase({ user: null, loading: false }));
      });
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Navigate to="/dashboard#products" replace />} />
          <Route path="/price-history" element={<PriceHistory />} />
          <Route path="/monitoring-logs" element={<MonitoringLogs />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
