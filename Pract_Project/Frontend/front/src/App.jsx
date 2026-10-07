import React from "react";
import LandingPage from "./Pages/Landing_page";
import Login from "./Pages/Login";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoutes from "../src/Comp/ProtectedRoutes";
import Dashboard from "./Pages/Dashboard";
import { Store } from "./Utils/Redux/Store";
function App() {
  return (
    <div>
      <Toaster />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landin" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/Dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
