import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  RefreshCw,
  Activity,
  CheckCircle,
  XCircle,
  Search,
  Clock,
  ClipboardList,
  Package,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/products`;

function MonitoringLogs() {
  const [logs, setLogs] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch monitoring logs
  useEffect(() => {
    const getLogs = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/monitoring-logs?limit=200`
        );

        setLogs(response.data.logs || []);
        setMessage("");
      } catch (error) {
        console.log(error);

        setMessage(
          error.response?.data?.message ||
            "Unable to load monitoring logs"
        );
      } finally {
        setLoading(false);
      }
    };

    getLogs();
  }, []);

  // Refresh monitoring logs
  const refreshLogs = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/monitoring-logs?limit=200`
      );

      setLogs(response.data.logs || []);
      setMessage("");
    } catch (error) {
      console.log(error);

      setMessage(
        error.response?.data?.message ||
          "Unable to refresh monitoring logs"
      );
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const successfulChecks = logs.filter(
    (log) => log.status === "success"
  ).length;

  const failedChecks = logs.filter(
    (log) => log.status === "failed"
  ).length;

  const filteredLogs = logs.filter((log) =>
    `${log.productName} ${log.message} ${log.source} ${log.status}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-blue-600">
              Monitoring
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Monitoring Logs
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              Review manual and automatic product checking records.
            </p>
          </div>

          <button
            onClick={refreshLogs}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh Logs
          </button>
        </div>

        {/* Demo Notice */}
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <div className="rounded-lg bg-amber-100 p-2">
            <Activity size={18} className="text-amber-700" />
          </div>

          <div>
            <p className="text-sm font-bold text-amber-900">
              Product Page Check Records
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-800">
              Successful checks save the price read from the configured product page. The current backend does not automatically detect stock availability.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Checks
              </p>

              <div className="rounded-lg bg-blue-50 p-2.5">
                <ClipboardList size={20} className="text-blue-600" />
              </div>
            </div>

            <h3 className="mt-3 text-3xl font-bold text-slate-900">
              {logs.length}
            </h3>

            <p className="mt-2 text-xs text-slate-400">
              Available monitoring records
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Successful Checks
              </p>

              <div className="rounded-lg bg-emerald-50 p-2.5">
                <CheckCircle size={20} className="text-emerald-600" />
              </div>
            </div>

            <h3 className="mt-3 text-3xl font-bold text-emerald-600">
              {successfulChecks}
            </h3>

            <p className="mt-2 text-xs text-slate-400">
              Successfully completed checks
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Failed Checks
              </p>

              <div className="rounded-lg bg-rose-50 p-2.5">
                <XCircle size={20} className="text-rose-600" />
              </div>
            </div>

            <h3 className="mt-3 text-3xl font-bold text-rose-600">
              {failedChecks}
            </h3>

            <p className="mt-2 text-xs text-slate-400">
              Checks that encountered errors
            </p>
          </div>
        </section>

        {/* Error Message */}
        {message && (
          <div className="mb-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        )}

        {/* Logs Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                All Monitoring Records
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest records from your monitoring system.
              </p>
            </div>

            <span className="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {filteredLogs.length} Records
            </span>
          </div>

          {/* Search */}
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="relative max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                placeholder="Search product, status or message..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-50"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-14 text-center">
              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">
                Loading monitoring records...
              </p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-14 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <ClipboardList size={24} className="text-slate-400" />
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-800">
                No monitoring records found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Use Check Now or wait for an automatic monitoring cycle.
              </p>
            </div>
          ) : (
            <>
            <div className="divide-y divide-slate-100 sm:hidden">
              {filteredLogs.map((log) => (
                <article key={log._id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-900">{log.productName || "Unknown product"}</p>
                      <p className="mt-1 text-xs text-slate-500">{log.source || "automatic"} check</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${log.status === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{log.status}</span>
                  </div>
                  <p className="text-xs leading-5 text-slate-600">{log.message}</p>
                  <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">{log.price == null ? "No price" : `₹${log.price}`}</span>
                    <span>{log.checkedAt ? new Date(log.checkedAt).toLocaleString() : "Not available"}</span>
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[850px] text-left">
                <thead>
                  <tr className="bg-slate-50">
                    {[
                      "Product",
                      "Result",
                      "Message",
                      "Price",
                      "Check Type",
                      "Checked At",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log._id}
                      className="border-t border-slate-100 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                            <Package size={17} className="text-blue-600" />
                          </div>

                          <span className="text-sm font-semibold text-slate-800">
                            {log.productName || "Unknown product"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            log.status === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          {log.status === "success" ? (
                            <CheckCircle size={12} />
                          ) : (
                            <XCircle size={12} />
                          )}

                          {log.status}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-xs leading-5 text-slate-600">
                        {log.message}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                        {log.price == null ? "—" : `₹${log.price}`}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium capitalize text-slate-600">
                          {log.source || "automatic"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Clock size={13} />

                          {log.checkedAt
                            ? new Date(log.checkedAt).toLocaleString()
                            : "Not available"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}

          <div className="border-t border-slate-100 px-5 py-3.5 sm:px-6">
            <p className="text-xs text-slate-400">
              Showing {filteredLogs.length} of {logs.length} records
            </p>
          </div>
        </section>

        <footer className="mt-7 text-xs text-slate-400">
          Quick Commerce Stock Watcher · Monitoring Logs
        </footer>
      </div>
    </div>
  );
}

export default MonitoringLogs;  