
import React from "react";
import { useSelector } from "react-redux";

import OwnerDashboard from "../Comp/Dashboard/OwnerDashboard";
import AdminDashboard from "../Comp/Dashboard/AdminDashborad";
import EmployeeDashboard from "../Comp/Dashboard/EmployeeDashboard";

function Dashboard() {

  const user = useSelector((store) => store.user);

  console.log(user);

  if (user?.role === "owner") {
    return <OwnerDashboard />;
  }

  if (user?.role === "admin") {
    return <AdminDashboard />;
  }

  if (user?.role === "employee") {
    return <EmployeeDashboard />;
  }

  return null;
}

export default Dashboard;

