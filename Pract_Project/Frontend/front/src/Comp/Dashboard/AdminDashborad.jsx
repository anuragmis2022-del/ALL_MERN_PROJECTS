import { BACKEND_URL } from "../../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import {
  LayoutDashboard,
  Users,
  UserRound,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

const links = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { label: "Teams", icon: Users, path: "/Teams" },
  { label: "Employees", icon: UserRound, path: "/Employees" },
  { label: "Tasks", icon: ClipboardList, path: "/Tasks" },
  { label: "Messages", icon: MessageSquare, path: "/Messages" },
];

function AdminDashboard() {
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const baseURL = BACKEND_URL;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const teamsResponse = await axios.get(
          `${baseURL}/api/admin/teams`,
          { withCredentials: true }
        );

        const teamList = teamsResponse.data.data || [];
        setTeams(teamList);

        // Load employees from each team.
        const employeeResponses = await Promise.all(
          teamList.map((team) =>
            axios.get(
              `${baseURL}/api/admin/teams/${team._id}/employees`,
              { withCredentials: true }
            )
          )
        );

        const allEmployees = employeeResponses.flatMap(
          (response) => response.data.data || []
        );

        // Remove duplicates in case an employee appears more than once.
        const uniqueEmployees = [
          ...new Map(
            allEmployees.map((employee) => [
              employee._id,
              employee,
            ])
          ).values(),
        ];

        setEmployees(uniqueEmployees);
      } catch (error) {
        console.error("DASHBOARD DATA ERROR:", error);
      }
    };

    loadDashboardData();
  }, []);

  const search = searchTerm.trim().toLowerCase();

  const filteredEmployees = employees.filter((employee) =>
    (employee.name || "").toLowerCase().includes(search) ||
    (employee.email || "").toLowerCase().includes(search)
  );

  const activeEmployees = employees.filter(
    (employee) => employee.isActive
  ).length;

  const activePercentage = employees.length
    ? Math.round((activeEmployees / employees.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchTerm} />

      <div className="flex">
        <Sidebar links={links} />

        <main className="min-w-0 flex-1 p-7">
          <div className="mb-6">
            <p className="mb-1 text-sm text-blue-500">Overview</p>

            <h1 className="text-2xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your organization, teams and employees from one place.
            </p>
          </div>

          {/* Dashboard statistics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-500">
                Employees
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {employees.length}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Total employees
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-500">
                Teams
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {teams.length}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Total teams
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-500">
                Active Employees
              </p>
              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {activeEmployees}
              </h2>
              <p className="mt-1 text-xs text-green-600">
                {activePercentage}% active
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <p className="text-sm font-semibold text-gray-500">
                Organization Status
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <p className="text-sm font-semibold text-gray-800">
                  Active
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Organization workspace
              </p>
            </div>
          </div>

          {/* Recent employees and search results */}
          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white xl:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-100 p-5">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {searchTerm.trim()
                      ? "Employee Search Results"
                      : "Recent Employees"}
                  </h2>
                  <p className="mt-1 text-xs text-gray-400">
                    Search by employee name or email
                  </p>
                </div>

                <button onClick={() => navigate("/Employees?view=list")}>
  View All
</button>
              </div>

              {filteredEmployees.length === 0 ? (
                <p className="p-8 text-center text-sm text-gray-400">
                  {employees.length === 0
                    ? "No employees found."
                    : "No employees match your search."}
                </p>
              ) : (
                (searchTerm.trim()
                  ? filteredEmployees
                  : filteredEmployees.slice(0, 5)
                ).map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {employee.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {employee.email}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        employee.isActive
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick action */}
            <div className="rounded-xl bg-slate-950 p-5">
              <p className="text-xs font-semibold text-blue-400">
                Quick action
              </p>

              <h2 className="mt-3 text-xl font-bold text-white">
                Add a new employee
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Add an employee and assign them to a team.
              </p>

              <button
                onClick={() => navigate("/Employees")}
                className="mt-6 w-full rounded-lg bg-white py-3 text-sm font-semibold text-slate-950 hover:bg-gray-100"
              >
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
