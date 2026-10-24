import { BACKEND_URL } from "../../Utils/api.jsx";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  MessageSquare,
} from "lucide-react";

const links = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/Dashboard",
  },
  {
    label: "My Team",
    icon: Users,
    path: "/MyTeam",
  },
  {
    label: "My Tasks",
    icon: ClipboardList,
    path: "/MyTasks",
  },
  {
    label: "Team Chat",
    icon: MessageSquare,
    path: "/TeamChat",
  },
];

function EmployeeDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get(
        BACKEND_URL + "/api/employee/tasks",
        { withCredentials: true }
      ),
      axios.get(
        BACKEND_URL +
          "/api/employee/team-members",
        { withCredentials: true }
      ),
    ])
      .then(([taskRes, teamRes]) => {
        console.log("DASHBOARD TASKS:", taskRes.data);
        console.log("DASHBOARD TEAM:", teamRes.data);

        setTasks(taskRes.data.data || []);
        setEmployees(teamRes.data.data || []);
      })
      .catch((error) => {
        console.log("DASHBOARD DATA ERROR:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalTasks = tasks.length;

  const inProgress = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const completed = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const todo = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.createdAt || 0)
    )
    .slice(0, 3);

  const getStatusColor = (status) => {
    if (status === "completed") {
      return "text-green-600";
    }

    if (status === "in-progress") {
      return "text-blue-500";
    }

    return "text-gray-500";
  };

  const formatStatus = (status) => {
    if (status === "in-progress") {
      return "In Progress";
    }

    if (status === "todo") {
      return "Todo";
    }

    if (status === "completed") {
      return "Completed";
    }

    return status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar links={links} />

        <main className="flex-1 min-w-0 p-7">
          <div className="mb-6">
            <p className="text-sm text-blue-500 mb-1">
              Overview
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Employee Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your tasks and stay connected with your team.
            </p>
          </div>

          {loading ? (
            <p className="text-gray-500">
              Loading dashboard...
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-500">
                    My Tasks
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {totalTasks}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Assigned to you
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-500">
                    In Progress
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {inProgress}
                  </h2>

                  <p className="text-xs text-blue-500 mt-1">
                    Currently working
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-500">
                    Completed
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {completed}
                  </h2>

                  <p className="text-xs text-green-500 mt-1">
                    Tasks completed
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-gray-500">
                    My Team
                  </p>

                  <h2 className="text-3xl font-bold text-gray-900 mt-2">
                    {employees.length}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Team members
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl">
                  <div className="p-5 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-900">
                      My Recent Tasks
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Your latest assigned or updated tasks
                    </p>
                  </div>

                  {recentTasks.length === 0 ? (
                    <div className="p-5 text-sm text-gray-500">
                      No tasks assigned to you yet.
                    </div>
                  ) : (
                    recentTasks.map((task) => (
                      <div
                        key={task._id}
                        className="px-5 py-4 border-b border-gray-100 last:border-b-0"
                      >
                        <h3 className="text-sm font-semibold text-gray-800">
                          {task.title}
                        </h3>

                        <p className={`text-xs mt-1 ${getStatusColor(task.status)}`}>
                          {formatStatus(task.status)}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-slate-950 rounded-xl p-5">
                  <p className="text-xs text-blue-400 font-semibold">
                    Quick action
                  </p>

                  <h2 className="text-xl font-bold text-white mt-3">
                    Open Team Chat
                  </h2>

                  <p className="text-sm text-gray-400 mt-2">
                    Communicate with members of your team.
                  </p>

                  <button
                    onClick={() => navigate("/TeamChat")}
                    className="w-full bg-white text-slate-950 font-semibold text-sm rounded-lg py-3 mt-6 hover:bg-gray-100"
                  >
                    Open Chat
                  </button>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                To Do tasks: {todo}
              </p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
