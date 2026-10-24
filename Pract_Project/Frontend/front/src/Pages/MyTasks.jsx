import { BACKEND_URL } from "../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";

function MyTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const getTasks = () => {
    axios
      .get(
        BACKEND_URL + "/api/admin/alltask",
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        console.log("MY TASKS:", res.data);

        setTasks(res.data.foundAllTask || []);
      })
      .catch((error) => {
        console.log("GET MY TASKS ERROR:", error);
      })
      .finally(() => {
        setLoading(false);
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
          View tasks assigned to you.
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="bg-white border rounded-xl p-6">
          <p className="text-gray-600">
            No tasks assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="bg-white border border-gray-200 rounded-xl p-5"
            >
              <div className="flex justify-between gap-4">
                <h2 className="font-bold text-gray-900">
                  {task.title}
                </h2>

                <span className="text-sm text-blue-600">
                  {task.priority}
                </span>
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {task.description}
              </p>

              <p className="text-sm text-gray-500 mt-3">
                Status: {task.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyTasks;
