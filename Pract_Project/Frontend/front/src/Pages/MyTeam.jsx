import { BACKEND_URL } from "../Utils/api.jsx";

import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Comp/Dashboard/Navbar";
import Sidebar from "../Comp/Dashboard/Sidebar";
import { Users, RefreshCw } from "lucide-react";

function MyTeam() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const baseURL = BACKEND_URL;

  const getTeamMembers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.get(
        `${baseURL}/api/employee/team-members`,
        {
          withCredentials: true,
        }
      );

      console.log("MY TEAM RESPONSE:", res.data);

      setEmployees(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (error) {
      console.error("GET MY TEAM ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load team members. Please try again."
      );
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, [baseURL]);

  useEffect(() => {
    getTeamMembers();
  }, [getTeamMembers]);

  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      (employee.name || "").toLowerCase().includes(search) ||
      (employee.email || "").toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchTerm} />

      <div className="flex">
        <Sidebar />

        <main className="min-w-0 flex-1 p-6 md:p-7">
          {/* Page heading */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="mb-1 text-sm text-blue-500">
                Workspace
              </p>

              <h1 className="text-2xl font-bold text-gray-900">
                My Team
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                View the employees assigned to your team.
              </p>
            </div>

            <button
              type="button"
              onClick={getTeamMembers}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-60"
            >
              <RefreshCw size={16} />
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {/* Team summary */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Users size={22} />
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Team Members
                </p>

                <p className="text-2xl font-bold text-gray-900">
                  {employees.length}
                </p>
              </div>
            </div>
          </div>

          {/* Employee list */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <div className="border-b border-gray-100 p-5">
              <h2 className="font-bold text-gray-900">
                Team Members
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Employees belonging to your assigned team.
              </p>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-gray-500">
                Loading team members...
              </div>
            ) : error ? (
              <div className="p-6">
                <p className="text-sm text-red-600">{error}</p>

                <button
                  type="button"
                  onClick={getTeamMembers}
                  className="mt-3 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
                >
                  Try Again
                </button>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="p-8 text-center">
                <Users
                  size={32}
                  className="mx-auto mb-3 text-gray-300"
                />

                <p className="font-semibold text-gray-700">
                  {employees.length === 0
                    ? "No team members found."
                    : "No matching employees found."}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {employees.length === 0
                    ? "Ask your admin to assign you and your teammates to the same team."
                    : "Try searching with a different name or email."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredEmployees.map((employee) => (
                  <div
                    key={employee._id}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                      {employee.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {employee.name}
                      </p>

                      <p className="break-words text-sm text-gray-500">
                        {employee.email}
                      </p>
                    </div>

                    <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MyTeam;
