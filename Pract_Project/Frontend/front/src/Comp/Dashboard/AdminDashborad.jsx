import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import {LayoutDashboard, Building2, ShieldCheck} from "lucide-react"

const links = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/Dashboard",
  },
  {
    label: "Teams",
    icon: Building2,
    path: "/Teams",
  },
  {
    label: "Employee",
    icon: ShieldCheck,
    path: "/employees",
  },
];

function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar links={links}/>

        {/* Main Content */}
        <main className="flex-1 p-7">
          {/* Page Title */}
          <div className="mb-6">
            <p className="text-sm text-blue-500 mb-1">Overview</p>

            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your organization, teams and employees from one place.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">Employees</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">24</h2>

              <p className="text-xs text-gray-400 mt-1">Total employees</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">Teams</p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">6</h2>

              <p className="text-xs text-gray-400 mt-1">Active teams</p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Active Employees
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">21</h2>

              <p className="text-xs text-green-500 mt-1">88% active</p>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Organization Status
              </p>

              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>

                <p className="text-sm font-semibold text-gray-800">Active</p>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Organization is running normally
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-5 mt-5">
            {/* Recent Employees */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Recent Employees
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Recently added employees
                  </p>
                </div>

                <button className="text-sm font-semibold text-blue-500">
                  View all
                </button>
              </div>

              {/* Employee 1 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
                    AM
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Anurag Mishra
                    </p>

                    <p className="text-xs text-gray-400">Development Team</p>
                  </div>
                </div>

                <span className="text-xs text-green-500 bg-green-50 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Employee 2 */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
                    RK
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Rahul Kumar
                    </p>

                    <p className="text-xs text-gray-400">Marketing Team</p>
                  </div>
                </div>

                <span className="text-xs text-green-500 bg-green-50 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>

              {/* Employee 3 */}
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
                    PS
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Priya Sharma
                    </p>

                    <p className="text-xs text-gray-400">HR Team</p>
                  </div>
                </div>

                <span className="text-xs text-green-500 bg-green-50 px-3 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>

            {/* Quick Action */}
            <div className="bg-slate-950 rounded-xl p-5">
              <p className="text-xs text-blue-400 font-semibold">
                Quick action
              </p>

              <h2 className="text-xl font-bold text-white mt-3">
                Add a new employee
              </h2>

              <p className="text-sm text-gray-400 mt-2">
                Add an employee and assign them to a team.
              </p>

              <button className="w-full bg-white text-slate-950 font-semibold text-sm rounded-lg py-3 mt-6 hover:bg-gray-100">
                Add Employee
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboard;
