
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

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

function OwnerDashboard() {
  const nav = useNavigate();

  const [analytics, setAnalytics] = useState({});
  const [organizations, setOrganizations] = useState([]);
  const [orgAdmins, setOrgAdmins] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        // 1. Get dashboard statistics
        const res1 = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/analytics/",
          {
            withCredentials: true,
          }
        );

        setAnalytics(res1.data.data || {});

        // 2. Get all organizations
        const res2 = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/owner/",
          {
            withCredentials: true,
          }
        );

        setOrganizations(res2.data.data || []);

        // 3. Get organizations with admin counts
        const res3 = await axios.get(
          import.meta.env.VITE_BACKEND_URL +
            "/api/analytics/all_Org_Admin",
          {
            withCredentials: true,
          }
        );

        setOrgAdmins(res3.data.data || []);

      } catch (error) {
        console.log("Dashboard Error:", error);
      }
    };

    getData();
  }, []);

  // Search organizations
  const filteredOrganizations = organizations.filter((org) => {
    return (org.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase());
  });

  // Show search results or 4 recent organizations
  let displayOrganizations = [];

  if (search.trim() !== "") {
    displayOrganizations = filteredOrganizations;
  } else {
    displayOrganizations = orgAdmins.slice(0, 4);
  }

  // Dashboard numbers
  const totalOrganizations = analytics.totalOrganization || 0;
  const totalAdmins = analytics.totalAdmins || 0;
  const activeOrganizations = analytics.activeOrganization || 0;

  let activePercentage = 0;

  if (totalOrganizations > 0) {
    activePercentage = Math.floor(
      (activeOrganizations / totalOrganizations) * 100
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <Navbar onSearch={setSearch} />

      <div className="flex">

        <Sidebar links={links} />

        <main className="flex-1 min-w-0 p-7">

          {/* Page Heading */}
          <div className="mb-6">
            <p className="text-sm text-blue-500 mb-1">
              Overview
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Owner Dashboard
            </h1>

            <p className="text-sm text-gray-500 mt-1">
              Manage your organizations and administrators
              from one place.
            </p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            {/* Total Organizations */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Organizations
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {totalOrganizations}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Total organizations
              </p>
            </div>

            {/* Administrators */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Administrators
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {totalAdmins}
              </h2>

              <p className="text-xs text-gray-400 mt-1">
                Across all organizations
              </p>
            </div>

            {/* Active Organizations */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-semibold text-gray-500">
                Active Organizations
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {activeOrganizations}
              </h2>

              <p className="text-xs text-green-500 mt-1">
                {activePercentage}% active
              </p>
            </div>

            {/* System Status */}
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
                    {search.trim()
                      ? "Search Results"
                      : "Recent Organizations"}
                  </h2>

                  <p className="text-xs text-gray-400 mt-1">
                    {search.trim()
                      ? "Organizations matching your search"
                      : "Recently created organizations"}
                  </p>
                </div>

                <button
                  onClick={() => nav("/Organization")}
                  className="text-sm font-semibold text-blue-500"
                >
                  View all
                </button>

              </div>

              {displayOrganizations.length === 0 ? (

                <p className="p-5 text-sm text-gray-500">
                  {search.trim()
                    ? "No matching organizations found."
                    : "No organizations found."}
                </p>

              ) : (

                displayOrganizations.map((org) => {
                  return (
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
                        className={
                          org.isActive
                            ? "shrink-0 text-xs px-3 py-1 rounded-full text-green-500 bg-green-50"
                            : "shrink-0 text-xs px-3 py-1 rounded-full text-red-500 bg-red-50"
                        }
                      >
                        {org.isActive ? "Active" : "Inactive"}
                      </span>

                    </div>
                  );
                })

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
                onClick={() => nav("/Organization")}
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
