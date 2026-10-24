import { BACKEND_URL } from "../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState({});
  const [message, setMessage] = useState("");

  const baseURL = BACKEND_URL;

  const getTeams = async () => {
    try {
      const res = await axios.get(
        baseURL + "/api/admin/teams",
        { withCredentials: true }
      );

      setTeams(res.data.data);
    } catch (error) {
      console.log("GET TEAMS ERROR:", error);
    }
  };

  const getEmployees = async () => {
    try {
      const res = await axios.get(
        baseURL + "/api/admin/employees",
        { withCredentials: true }
      );

      setEmployees(res.data.data);
    } catch (error) {
      console.log("GET EMPLOYEES ERROR:", error);
    }
  };

  const refreshData = () => {
    getTeams();
    getEmployees();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const createTeam = async () => {
    if (!name.trim()) {
      setMessage("Please enter a team name.");
      return;
    }

    try {
      await axios.post(
        baseURL + "/api/admin/teams",
        { name: name.trim() },
        { withCredentials: true }
      );

      setName("");
      setMessage("Team created successfully.");
      getTeams();
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not create team."
      );
      console.log("CREATE TEAM ERROR:", error);
    }
  };

  const assignEmployee = async (teamId) => {
    const employeeId = selectedEmployees[teamId];

    if (!employeeId) {
      setMessage("Please select an employee.");
      return;
    }

    const employee = employees.find(
      (item) => item._id === employeeId
    );

    if (!employee) {
      setMessage("Employee not found.");
      return;
    }

    try {
      await axios.patch(
        `${baseURL}/api/admin/teams/${teamId}/employees/${employeeId}`,
        {},
        { withCredentials: true }
      );

      const team = teams.find((item) => item._id === teamId);

      setMessage(
        `${employee.name} assigned to ${team.name} successfully.`
      );

      setSelectedEmployees((previous) => ({
        ...previous,
        [teamId]: "",
      }));

      getEmployees();
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Could not assign employee."
      );
      console.log("ASSIGN EMPLOYEE ERROR:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-7">
        <div className="mb-6">
          <p className="text-sm text-blue-500 mb-1">
            Management
          </p>

          <h1 className="text-2xl font-bold text-gray-900">
            Teams
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Create teams and manage employee assignments.
          </p>
        </div>

        {message && (
          <div className="bg-blue-50 text-blue-700 rounded-lg p-3 mb-5 text-sm">
            {message}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5">
          <h2 className="text-sm font-bold text-gray-900">
            Create Team
          </h2>

          <div className="flex gap-3 mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter team name"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400"
            />

            <button
              onClick={createTeam}
              className="bg-slate-950 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800"
            >
              Create Team
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Your Teams
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Assign employees or move them between teams.
            </p>
          </div>

          {teams.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-400">
              No teams found.
            </div>
          ) : (
            teams.map((team) => {
              const teamEmployees = employees.filter(
                (employee) =>
                  employee.teamId?._id === team._id
              );

              const selectedEmployee = employees.find(
                (employee) =>
                  employee._id === selectedEmployees[team._id]
              );

              const currentTeamId = selectedEmployee?.teamId?._id;

              const isAlreadyInTeam =
                currentTeamId === team._id;

              return (
                <div
                  key={team._id}
                  className="px-5 py-5 border-b border-gray-100"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center text-sm font-bold">
                        {team.name.slice(0, 2).toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {team.name}
                        </p>

                        <p className="text-xs text-gray-400">
                          {team.isActive
                            ? `${teamEmployees.length} active employees`
                            : "Inactive team"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full ${
                        team.isActive
                          ? "text-green-500 bg-green-50"
                          : "text-red-500 bg-red-50"
                      }`}
                    >
                      {team.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {team.isActive && (
                    <div className="mt-4 flex gap-3 flex-wrap">
                      <select
                        value={selectedEmployees[team._id] || ""}
                        onChange={(e) =>
                          setSelectedEmployees((previous) => ({
                            ...previous,
                            [team._id]: e.target.value,
                          }))
                        }
                        className="flex-1 min-w-48 border border-gray-200 rounded-lg px-4 py-2 text-sm"
                      >
                        <option value="">
                          Select employee to assign or move
                        </option>

                        {employees.map((employee) => (
                          <option
                            key={employee._id}
                            value={employee._id}
                          >
                            {employee.name}
                            {" — "}
                            {employee.teamId?.name || "Unassigned"}
                          </option>
                        ))}
                      </select>

                      <button
                        onClick={() => assignEmployee(team._id)}
                        disabled={
                          !selectedEmployees[team._id] ||
                          isAlreadyInTeam
                        }
                        className="bg-slate-950 text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40"
                      >
                        {selectedEmployee?.teamId
                          ? "Move to Team"
                          : "Assign Employee"}
                      </button>
                    </div>
                  )}

                  {teamEmployees.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-gray-500">
                        Current members
                      </p>

                      {teamEmployees.map((employee) => (
                        <div
                          key={employee._id}
                          className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2"
                        >
                          <div>
                            <p className="text-sm text-gray-800">
                              {employee.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {employee.email}
                            </p>
                          </div>

                          <span className="text-xs text-green-600">
                            Assigned
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Teams;
