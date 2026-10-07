import React from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { LayoutDashboard, Building2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const links = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/Dashboard",
  },
  {
    label: "Organization",
    icon: Building2,
    path: "/Organization",
  },
  {
    label: "Admin",
    icon: ShieldCheck,
    path: "/Admin",
  },
];

function OwnerDashboard() {
  const [analytics, setAnalytics] = useState("");

  const [allOrgAdmin, setAllOrgAdmin] = useState([]);
console.log(allOrgAdmin)


  useEffect(() => {
    Promise.all([
      axios.get(import.meta.env.VITE_BACKEND_URL + "/api/analytics/", {
        withCredentials: true,
      }),
      axios.get(import.meta.env.VITE_BACKEND_URL + "/api/owner/", {
        withCredentials: true,
      }),
      axios.get(
        import.meta.env.VITE_BACKEND_URL + "/api/analytics/all_Org_Admin",
        { withCredentials: true },
      ),
    ]).then((data) => {
      setAnalytics(data[0].data.data);
      setAllOrgAdmin(data[1].data.data);
      setAllOrgAdmin(data[2].data.data);

    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        <Sidebar links={links} />

        <main className="flex-1 p-7">
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
          <div className="grid grid-cols-4 gap-4">
            {/* Card 1 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Organizations
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalOrganization}
              </h2>

              <p className="text-xs text-gray-400 mt-1">Total organizations</p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Administrators
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.totalAdmins}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Across all organizations
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Active Organizations
              </p>

              <h2 className="text-3xl font-bold text-gray-900 mt-2">
                {analytics.activeOrganization}
              </h2>

              <p className="text-xs text-green-500 mt-1">
                {Math.floor(
                  (analytics.activeOrganization / analytics.totalOrganization) *
                    100,
                )}
                % active
              </p>
            </div>

            {/* Card 4 */}
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
          <div className="grid grid-cols-3 gap-5 mt-5">
            {/* Recent Organizations */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Recent Organizations
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    Recently created organizations
                  </p>
                </div>

                <button className="text-sm font-semibold text-blue-500">
                  View all
                </button>
              </div>

              {/* Organizations - maximum 4 */}
              {allOrgAdmin.slice(0, 4).map((org) => (
                <div
                  key={org._id}
                  className="flex items-center justify-between px-5 py-4 border-b border-gray-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-500 rounded-md flex items-center justify-center text-xs font-bold">
                      OR
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {org.name}
                      </p>

                      <p className="text-xs text-gray-400">{org.adminCount} admins</p>
                    </div>
                  </div>

                  <span className="text-xs text-green-500 bg-green-50 px-3 py-1 rounded-full">
                    {org.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
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

              <button className="w-full bg-white text-slate-950 font-semibold text-sm rounded-lg py-3 mt-6 hover:bg-gray-100">
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
