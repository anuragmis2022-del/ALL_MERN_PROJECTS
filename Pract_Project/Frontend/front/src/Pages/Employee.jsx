import { BACKEND_URL } from "../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import Navbar from "../Comp/Dashboard/Navbar";

function Employees() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [creating, setCreating] = useState(false);

  const [searchParams] = useSearchParams();
  const showListFirst = searchParams.get("view") === "list";

  const baseURL = BACKEND_URL;

  // Load teams
  const getTeams = async () => {
    setLoadingTeams(true);

    try {
      const res = await axios.get(
        `${baseURL}/api/admin/teams`,
        { withCredentials: true }
      );

      const teamData = res.data.data || [];
      setTeams(teamData);
    } catch (error) {
      console.error("GET TEAMS ERROR:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  // Load employees for selected team
  const getEmployees = async (teamId) => {
    if (!teamId) {
      setEmployees([]);
      return;
    }

    setLoadingEmployees(true);

    try {
      const res = await axios.get(
        `${baseURL}/api/admin/teams/${teamId}/employees`,
        { withCredentials: true }
      );

      setEmployees(res.data.data || []);
    } catch (error) {
      console.error("GET EMPLOYEES ERROR:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

  // Select team
  const selectTeam = (teamId) => {
    setSelectedTeam(teamId);
    setSearchTerm("");
    getEmployees(teamId);
  };

  // Create employee
  const createEmployee = async (e) => {
    e.preventDefault();

    if (!selectedTeam) {
      alert("Please select a team first.");
      return;
    }

    if (!name.trim() || !email.trim() || !password) {
      alert("Please fill all employee fields.");
      return;
    }

    setCreating(true);

    try {
      const res = await axios.post(
        `${baseURL}/api/admin/teams/${selectedTeam}/employees`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
        },
        { withCredentials: true }
      );

      console.log("EMPLOYEE CREATED:", res.data);

      setName("");
      setEmail("");
      setPassword("");

      await getEmployees(selectedTeam);

      alert("Employee created successfully.");
    } catch (error) {
      console.error("CREATE EMPLOYEE ERROR:", error);

      alert(
        error.response?.data?.message ||
          "Could not create employee."
      );
    } finally {
      setCreating(false);
    }
  };

  // Search employees
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      (employee.name || "").toLowerCase().includes(search) ||
      (employee.email || "").toLowerCase().includes(search)
    );
  });

  // Employee list section
  const employeeList = (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-5">
        <h2 className="text-sm font-bold text-gray-900">
          Employee List
          {selectedTeam && ` (${filteredEmployees.length})`}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          View employees assigned to the selected team.
        </p>
      </div>

      {!selectedTeam ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Select a team above to see its employees.
        </div>
      ) : loadingEmployees ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Loading employees...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          {employees.length === 0
            ? "No employees found in this team."
            : "No employees match your search."}
        </div>
      ) : (
        filteredEmployees.map((employee) => (
          <div
            key={employee._id}
            className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800">
                {employee.name}
              </p>

              <p className="break-all text-xs text-gray-500">
                {employee.email}
              </p>
            </div>

            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs ${
                employee.isActive
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {employee.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ))
      )}
    </div>
  );

  // Create employee section
  const createEmployeeForm = (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-bold text-gray-900">
        Create Employee
      </h2>

      <p className="mt-1 text-sm text-gray-500">
        Add a new employee to the selected team.
      </p>

      <form onSubmit={createEmployee} autoComplete="off">
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input
            type="text"
            name="new-employee-name"
            autoComplete="off"
            placeholder="Employee name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
          />

          <input
            type="email"
            name="new-employee-email"
            autoComplete="off"
            placeholder="Employee email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
          />

          <input
            type="password"
            name="new-employee-password"
            autoComplete="new-password"
            placeholder="Employee password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-lg bg-slate-950 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {creating ? "Creating..." : "Create Employee"}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchTerm} />

      <main className="p-7">
        <div className="mb-6">
          <p className="mb-1 text-sm text-blue-500">
            Management
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Employees
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View employees first or create a new employee below.
          </p>
        </div>

        {/* Team selection */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-gray-900">
            Select Team
          </h2>

          {loadingTeams ? (
            <p className="text-sm text-gray-500">
              Loading teams...
            </p>
          ) : teams.length === 0 ? (
            <p className="text-sm text-gray-500">
              No teams found. Please create a team first.
            </p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {teams.map((team) => (
                <button
                  key={team._id}
                  type="button"
                  onClick={() => selectTeam(team._id)}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                    selectedTeam === team._id
                      ? "bg-slate-950 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View All opens list before create form */}
        {showListFirst ? (
          <>
            {employeeList}
            {createEmployeeForm}
          </>
        ) : (
          <>
            {employeeList}
            {createEmployeeForm}
          </>
        )}
      </main>
    </div>
  );
}

export default Employees;
