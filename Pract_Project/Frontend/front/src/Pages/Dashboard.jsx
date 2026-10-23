import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import api from "../Utils/api";
import OwnerDashboard from "../Comp/Dashboard/OwnerDashboard";
import AdminDashboard from "../Comp/Dashboard/AdminDashborad";

function EmployeeDashboard() {
  const user = useSelector((store) => store.user);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    api.get("/api/employee/tasks")
      .then((res) => {
        if (!cancelled) {
          setTasks(Array.isArray(res.data?.data) ? res.data.data : []);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            "Unable to load your tasks. Please refresh the page."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    { label: "Assigned tasks", value: tasks.length },
    {
      label: "To do",
      value: tasks.filter((task) => task.status === "todo").length,
    },
    {
      label: "In progress",
      value: tasks.filter((task) => task.status === "in-progress").length,
    },
    {
      label: "Completed",
      value: tasks.filter((task) => task.status === "completed").length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold">TeamFlow</h1>
          <p className="text-sm text-slate-500">Employee workspace</p>
        </div>
        <div className="text-right">
          <p className="font-semibold">{user?.name || "Employee"}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6 md:p-8">
        <h2 className="text-3xl font-bold">
          Welcome, {user?.name || "Employee"}!
        </h2>
        <p className="mb-8 mt-2 text-slate-500">
          View your assigned work and track your progress.
        </p>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-3xl font-bold">
                {loading ? "..." : card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h3 className="text-lg font-bold">My Tasks</h3>
          </div>

          <div className="space-y-3 p-5">
            {loading && <p>Loading tasks...</p>}

            {!loading && error && (
              <p className="text-red-600">{error}</p>
            )}

            {!loading && !error && tasks.length === 0 && (
              <p className="text-slate-500">No tasks assigned yet.</p>
            )}

            {!loading && !error && tasks.map((task) => (
              <article
                key={task._id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <h4 className="font-semibold">{task.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      {task.description}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-slate-100 px-3 py-1 text-xs capitalize">
                    {(task.status || "todo").replace("-", " ")}
                  </span>
                </div>
                <p className="mt-3 text-xs capitalize text-slate-500">
                  Priority: {task.priority || "Not specified"}
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Dashboard() {
  const user = useSelector((store) => store.user);

  if (!user) {
    return <div className="p-8">Loading your dashboard...</div>;
  }

  if (user.role === "owner") return <OwnerDashboard />;
  if (user.role === "admin") return <AdminDashboard />;
  if (user.role === "employee") return <EmployeeDashboard />;

  return <div className="p-8">No dashboard is configured for this role.</div>;
}

export default Dashboard;
