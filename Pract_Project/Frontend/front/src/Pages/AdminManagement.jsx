
import { BACKEND_URL } from "../Utils/api.jsx";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

import Navbar from "../Comp/Dashboard/Navbar";
import Sidebar from "../Comp/Dashboard/Sidebar";

import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
} from "lucide-react";

const links = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { label: "Organization", icon: Building2, path: "/Organization" },
  { label: "Admin", icon: ShieldCheck, path: "/Admin" },
];

function AdminManagement() {
  const user = useSelector((state) => state.user);

  const [organizations, setOrganizations] = useState([]);
  const [organizationId, setOrganizationId] = useState("");
  const [admins, setAdmins] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // Load organizations
  const loadOrganizations = async () => {
    try {
      const res = await axios.get(
        BACKEND_URL + "/api/owner/",
        { withCredentials: true }
      );

      const list = res.data.data || [];

      setOrganizations(list);

      if (list.length > 0) {
        setOrganizationId((previousId) =>
          previousId || list[0]._id
        );
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not load organizations"
      );
    }
  };

  // Load admins for selected organization
  const loadAdmins = async (id) => {
    if (!id) {
      setAdmins([]);
      return;
    }

    try {
      const res = await axios.get(
        BACKEND_URL +
          "/api/owner/organization/" +
          id +
          "/admin",
        { withCredentials: true }
      );

      setAdmins(res.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not load admins"
      );
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  useEffect(() => {
    loadAdmins(organizationId);
  }, [organizationId]);

  // Handle name, email and password input
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Create admin
  const createAdmin = async (e) => {
    e.preventDefault();

    if (!organizationId) {
      toast.error("Create an organization first");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        BACKEND_URL +
          "/api/owner/organization/" +
          organizationId +
          "/admin",
        form,
        { withCredentials: true }
      );

      toast.success("Admin created successfully");

      setForm({
        name: "",
        email: "",
        password: "",
      });

      await loadAdmins(organizationId);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not create admin"
      );
    } finally {
      setLoading(false);
    }
  };

  // Activate or deactivate admin
  const toggleAdmin = async (admin) => {
    try {
      await axios.patch(
        BACKEND_URL + "/api/owner/admin/" + admin._id,
        {
          isActive: !admin.isActive,
        },
        {
          withCredentials: true,
        }
      );

      toast.success("Admin status updated");

      await loadAdmins(organizationId);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Could not update admin"
      );
    }
  };

  if (user && user.role !== "owner") {
    return <Navigate to="/Dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar links={links} />

        <main className="min-w-0 flex-1 p-7">
          <p className="mb-1 text-sm text-blue-500">
            Owner management
          </p>

          <h1 className="text-2xl font-bold">
            Administrators
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create an admin account for an organization.
          </p>

          {/* Create Admin */}
          <div className="my-6 rounded-xl border bg-white p-5">
            <label className="mb-2 block text-sm font-semibold">
              Organization
            </label>

            <select
              value={organizationId}
              onChange={(e) =>
                setOrganizationId(e.target.value)
              }
              className="mb-4 w-full rounded-lg border px-3 py-2"
            >
              <option value="">
                Select organization
              </option>

              {organizations.map((org) => (
                <option
                  key={org._id}
                  value={org._id}
                >
                  {org.name}
                  {org.isActive ? "" : " (inactive)"}
                </option>
              ))}
            </select>

            <form
              onSubmit={createAdmin}
              autoComplete="off"
              className="grid gap-3 md:grid-cols-2"
            >
              {/* Admin Name */}
              <input
                required
                type="text"
                name="name"
                minLength={2}
                maxLength={20}
                value={form.name}
                onChange={handleFormChange}
                placeholder="Admin name"
                autoComplete="off"
                className="rounded-lg border px-3 py-2"
              />

              {/* Admin Email */}
              <input
                required
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="Admin email"
                autoComplete="off"
                className="rounded-lg border px-3 py-2"
              />

              {/* Admin Password */}
              <input
                required
                type="password"
                name="password"
                value={form.password}
                onChange={handleFormChange}
                placeholder="Strong password"
                autoComplete="new-password"
                className="rounded-lg border px-3 py-2"
              />

              <button
                type="submit"
                disabled={loading || !organizationId}
                className="rounded-lg bg-slate-950 px-4 py-2 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create admin"}
              </button>
            </form>
          </div>

          {/* Admin List */}
          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b p-5 font-semibold">
              Admins in selected organization
            </div>

            {admins.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">
                No admins found for this organization.
              </p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between gap-3 border-b p-5 last:border-0"
                >
                  <div>
                    <p className="font-semibold">
                      {admin.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {admin.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        admin.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {admin.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleAdmin(admin)}
                      className="rounded-lg border px-3 py-2 text-sm"
                    >
                      {admin.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminManagement;
