import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white px-5 py-5 sm:px-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-sm font-semibold text-slate-700">Quick Commerce Stock Watcher</p><p className="mt-1 text-xs text-slate-500">Monitor product prices and availability.</p></div>
        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Link to="/dashboard" className="text-xs text-slate-500 hover:text-blue-700">Dashboard</Link>
          <Link to="/products" className="text-xs text-slate-500 hover:text-blue-700">Products</Link>
          <Link to="/price-history" className="text-xs text-slate-500 hover:text-blue-700">Price History</Link>
          <Link to="/monitoring-logs" className="text-xs text-slate-500 hover:text-blue-700">Monitoring Logs</Link>
        </nav>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-400">© {new Date().getFullYear()} Quick Commerce Stock Watcher. All rights reserved.</p></div>
    </footer>
  );
}
export default Footer;
