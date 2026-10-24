
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LandingPage from "./Pages/Landing_page";
import Login from "./Pages/Login";
import ProtectedRoutes from "./Comp/ProtectedRoutes";

import Dashboard from "./Pages/Dashboard";
import Teams from "./Pages/Teams";
import Employees from "./Pages/Employee";
import Tasks from "./Pages/Tasks";
import EmployeeTasks from "./Pages/EmployeeTasks";
import TeamChat from "./Pages/TeamChat";
import Organization from "./Pages/Organization";
import AdminManagement from "./Pages/AdminManagement";
import MyTeam from "./Pages/MyTeam";

function App() {
  return (
    <div>
      <Toaster />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landin" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/Dashboard" element={<Dashboard />} />

          <Route path="/Teams" element={<Teams />} />
          <Route path="/Organization" element={<Organization />} />
          <Route path="/Admin" element={<AdminManagement />} />
          <Route path="/Employees" element={<Employees />} />
          <Route path="/Tasks" element={<Tasks />} />

          {/* Employee task routes */}
          <Route
            path="/EmployeeTasks"
            element={<EmployeeTasks />}
          />
          <Route path="/MyTasks" element={<EmployeeTasks />} />

          {/* Employee team route */}
          <Route path="/MyTeam" element={<MyTeam />} />

          {/* Chat routes */}
          <Route path="/TeamChat" element={<TeamChat />} />
          <Route path="/Messages" element={<TeamChat />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
