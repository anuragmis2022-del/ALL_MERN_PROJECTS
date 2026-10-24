import { BACKEND_URL } from "../Utils/api.jsx";
import React, { useEffect, useState } from "react";
import axios from "axios";

function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);

  const getTasks = () => {
    axios
      .get(
        BACKEND_URL + "/api/employee/tasks",
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("MY TASKS:", res.data);
        setTasks(res.data.data);
      })
      .catch((error) => {
        console.log("GET TASKS ERROR:", error);
      });
  };

  const updateStatus = (taskId, status) => {
    axios
      .patch(
        BACKEND_URL +
          `/api/employee/tasks/${taskId}`,
        {
          status,
        },
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("TASK UPDATED:", res.data);

        getTasks();
      })
      .catch((error) => {
        console.log("UPDATE TASK ERROR:", error);
      });
  };

  useEffect(() => {
    getTasks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-7">

      <div className="mb-6">
        <p className="text-sm text-blue-500 mb-1">
          Workspace
        </p>

        <h1 className="text-2xl font-bold text-gray-900">
          My Tasks
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          View and manage your assigned tasks.
        </p>
      </div>

      <div className="space-y-4">

        {tasks.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-sm text-gray-500">
              No tasks assigned to you.
            </p>
          </div>
        )}

        {tasks.map((task) => (
          <div
            key={task._id}
            className="bg-white border border-gray-200 rounded-xl p-5"
          >

            <div className="flex justify-between items-start">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {task.title}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {task.description}
                </p>
              </div>

              <span className="text-xs font-semibold bg-gray-100 px-3 py-1 rounded-full">
                {task.priority}
              </span>

            </div>

            <div className="mt-4 flex items-center gap-3">

              <p className="text-sm text-gray-500">
                Status:
              </p>

              <select
                value={task.status}
                onChange={(e) =>
                  updateStatus(task._id, e.target.value)
                }
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
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

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default EmployeeTasks;