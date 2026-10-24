import { BACKEND_URL } from "../../Utils/api.jsx";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { LayoutDashboard, Building2, ShieldCheck } from "lucide-react";

const links = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/Dashboard" },
  { label: "Organization", icon: Building2, path: "/Organization" },
  { label: "Admin", icon: ShieldCheck, path: "/Admin" },
];

function OwnerDashboard() {
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [analyticsRes, organizationsRes, adminsRes] =
          await Promise.all([
            axios.get(
              BACKEND_URL + "/api/analytics/",
              { withCredentials: true }
            ),
            axios.get(
              BACKEND_URL + "/api/owner/",
              { withCredentials: true }
            ),
            axios.get(
              BACKEND_URL +
                "/api/analytics/all_Org_Admin",
              { withCredentials: true }
            ),
          ]);

        setAnalytics(analyticsRes.data.data || {});
        setOrganizations(organizationsRes.data.data || []);
        setOrgAdmins(adminsRes.data.data || []);
      } catch (error) {
        console.error("OWNER DASHBOARD ERROR:", error);
      }
    };

    loadDashboard();
  }, []);

  const filteredOrganizations = organizations.filter((org) =>
    (org.name || "")
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase())
  );

  const recentOrganizations = searchTerm.trim()
    ? filteredOrganizations
    : orgAdmins;

  const totalOrganizations = analytics.totalOrganization || 0;
  const activeOrganizations = analytics.activeOrganization || 0;
  const activePercentage = totalOrganizations
    ? Math.floor((activeOrganizations / totalOrganizations) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onSearch={setSearchTerm} />

      <div className="flex">
        <Sidebar links={links} />

        <main className="flex-1 min-w-0 p-7">
          {/* Page Title */}
          <div className="mb-6">
            <p className="text-sm text-blue-500 mb-1">Overview</p>
            <h1 className="text-2xl font-bold text-gray-900">
              Owner Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your organizations and administrators from one place.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Organizations
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {totalOrganizations}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Total organizations
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Administrators
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalAdmins || 0}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Across all organizations
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Active Organizations
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {activeOrganizations}
              </h2>
              <p className="text-xs text-green-500 mt-1">
                {activePercentage}% active
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                System Status
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm font-semibold text-gray-800">
                  All systems operational
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Everything is running normally
              </p>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">
            {/* Recent Organizations */}
            <div className="xl:col-span-2 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    {searchTerm.trim()
                      ? "Search Results"
                      : "Recent Organizations"}
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    {searchTerm.trim()
                      ? "Organizations matching your search"
                      : "Recently created organizations"}
                  </p>
                </div>

                <button
                  onClick={() => navigate("/Organization")}
                  className="text-sm font-semibold text-blue-500"
                >
                  View all
                </button>
              </div>

              {recentOrganizations.length === 0 ? (
                <p className="p-5 text-sm text-gray-500">
                  {searchTerm.trim()
                    ? "No matching organizations found."
                    : "No organizations found."}
                </p>
              ) : (
                recentOrganizations.slice(0, searchTerm.trim() ? undefined : 4).map((org) => (
                  <div
                    key={org._id}
                    className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
                        OR
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          {org.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {org.adminCount ?? 0} admins
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-xs px-3 py-1 rounded-full ${
                        org.isActive
                          ? "text-green-500 bg-green-50"
                          : "text-red-500 bg-red-50"
                      }`}
                    >
                      {org.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Quick Action */}
            <div className="bg-slate-950 rounded-xl p-5">
              <p className="text-xs text-blue-400 font-semibold">
                Quick action
              </p>
              <h2 className="text-xl font-bold text-white mt-3">
                Create a new organization
              </h2>
              <p className="text-sm text-gray-400 mt-2">
                Set up a new organization and assign its administrator.
              </p>

              <button
                onClick={() => navigate("/Organization")}
                className="w-full bg-white text-slate-950 font-semibold text-sm rounded-lg py-3 mt-6 hover:bg-gray-100"
              >
                Create Organization
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default OwnerDashboard;