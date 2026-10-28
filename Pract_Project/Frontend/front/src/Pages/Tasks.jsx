  import { BACKEND_URL } from "../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";

function Tasks() {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");

  const getTeams = () => {
    axios
      .get(BACKEND_URL + "/api/admin/teams", {
        withCredentials: true,
      })
      .then((res) => {
        console.log("TEAMS:", res.data);
        setTeams(res.data.data);
      })
      .catch((error) => {
        console.log("GET TEAMS ERROR:", error);
      });
  };

  const getEmployees = (teamId) => {
    axios
      .get(
        BACKEND_URL +
          `/api/admin/teams/${teamId}/employees`,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("EMPLOYEES:", res.data);
        setEmployees(res.data.data);
      })
      .catch((error) => {
        console.log("GET EMPLOYEES ERROR:", error);
      });
  };

  const selectTeam = (teamId) => {
    setSelectedTeam(teamId);
    setSelectedEmployee("");
    setEmployees([]);

    if (teamId) {
      getEmployees(teamId);
    }
  };

  const createTask = () => {
    if (!selectedEmployee) {
      console.log("Please select an employee");
      return;
    }

    axios
      .post(
        BACKEND_URL +
          `/api/admin/tasks/employee/${selectedEmployee}`,
        {
          title,
          description,
          status,
          priority,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("TASK CREATED:", res.data);

        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        alert(res.data.message || "Task assigned successfully");
      })
      .catch((error) => {
        console.log("CREATE TASK ERROR:", error);
      });
  };

  useEffect(() => {
    getTeams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-7">

      <div className="mb-6">
        <p className="text-sm text-blue-500 mb-1">
          Management
        </p>

        <h1 className="text-2xl font-bold text-gray-900">
          Tasks
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Create and assign tasks to employees.
        </p>
      </div>


      {/* CREATE TASK */}

      <div className="bg-white border border-gray-200 rounded-xl p-5">

        <h2 className="text-sm font-bold text-gray-900">
          Create Task
        </h2>

        <div className="grid grid-cols-2 gap-4 mt-4">

          {/* SELECT TEAM */}

          <select
            value={selectedTeam}
            onChange={(e) => selectTeam(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">
              Select Team
            </option>

            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name}
              </option>
            ))}
          </select>


          {/* SELECT EMPLOYEE */}

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="">
              Select Employee
            </option>

            {employees.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.name}
              </option>
            ))}
          </select>


          {/* TITLE */}

          <input
            type="text"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
          />


          {/* DESCRIPTION */}

          <textarea
            placeholder="Task description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none"
          />


          {/* STATUS */}

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="todo">
              Todo
            </option>

            <option value="in-progress">
              In Progress
            </option>

            <option value="completed">
              Completed
            </option>
          </select>


          {/* PRIORITY */}

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm"
          >
            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

        </div>


        {/* CREATE BUTTON */}

        <button
          onClick={createTask}
          className="mt-5 bg-slate-950 text-white px-5 py-2 rounded-lg text-sm font-semibold"
        >
          Create Task
        </button>

      </div>

    </div>
  );
}

export default Tasks;

