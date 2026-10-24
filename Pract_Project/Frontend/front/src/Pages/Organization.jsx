import { BACKEND_URL } from "../Utils/api.jsx";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Navbar from "../Comp/Dashboard/Navbar";
import Sidebar from "../Comp/Dashboard/Sidebar";
import { LayoutDashboard, Building2, ShieldCheck } from "lucide-react";

const links = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { label: "Organization", icon: Building2, path: "/Organization" },
  { label: "Admin", icon: ShieldCheck, path: "/Admin" },
];

const baseURL = BACKEND_URL;

export default function Organization() {
  const user = useSelector((state) => state.user);

  const [organizations, setOrganizations] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const loadOrganizations = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/owner/`, {
        withCredentials: true,
      });

      setOrganizations(res.data.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not load organizations"
      );
    }
  };

  useEffect(() => {
    loadOrganizations();
  }, []);

  if (user && user.role !== "owner") {
    return <Navigate to="/Dashboard" replace />;
  }

  const createOrganization = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Enter organization name");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${baseURL}/api/owner/`,
        { name: name.trim() },
        { withCredentials: true }
      );

      toast.success("Organization created");
      setName("");
      await loadOrganizations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not create organization"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleOrganization = async (org) => {
    try {
      await axios.patch(
        `${baseURL}/api/owner/organization/${org._id}`,
        { isActive: !org.isActive },
        { withCredentials: true }
      );

      toast.success(
        `Organization ${org.isActive ? "deactivated" : "activated"}`
      );

      await loadOrganizations();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Could not update organization"
      );
    }
  };

  const filteredOrganizations = organizations.filter((org) =>
    (org.name || "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchTerm} />

      <div className="flex">
        <Sidebar links={links} />

        <main className="flex-1 min-w-0 p-7">
          <p className="mb-1 text-sm text-blue-500">Owner management</p>

          <h1 className="text-2xl font-bold">Organizations</h1>

          <p className="mt-1 text-sm text-gray-500">
            Create organizations and manage their status.
          </p>

          <form
            onSubmit={createOrganization}
            className="my-6 flex gap-3 rounded-xl border bg-white p-5"
          >
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              placeholder="Organization name"
              className="min-w-0 flex-1 rounded-lg border px-4 py-2"
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-slate-950 px-5 py-2 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create organization"}
            </button>
          </form>

          <div className="overflow-hidden rounded-xl border bg-white">
            <div className="border-b p-5 font-semibold">
              All organizations
            </div>

            {filteredOrganizations.length === 0 ? (
              <p className="p-6 text-sm text-gray-500">
                {searchTerm.trim()
                  ? "No matching organizations found."
                  : "No organizations yet. Create your first organization above."}
              </p>
            ) : (
              filteredOrganizations.map((org) => (
                <div
                  key={org._id}
                  className="flex items-center justify-between gap-4 border-b p-5 last:border-0"
                >
                  <div>
                    <p className="font-semibold">{org.name}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Created{" "}
                      {org.createdAt
                        ? new Date(org.createdAt).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs ${
                        org.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleOrganization(org)}
                      className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                      {org.isActive ? "Deactivate" : "Activate"}
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