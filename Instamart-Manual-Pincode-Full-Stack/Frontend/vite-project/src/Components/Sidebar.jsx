import React from "react";
import { NavLink, Link } from "react-router-dom";
import { LayoutDashboard, Package, TrendingUp, ClipboardList, X, ShoppingBag } from "lucide-react";

function Sidebar({ mobileOpen, onClose }) {
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, end: true },
    { name: "Products", path: "/products", icon: Package },
    { name: "Price History", path: "/price-history", icon: TrendingUp },
    { name: "Monitoring Logs", path: "/monitoring-logs", icon: ClipboardList },
  ];

  const navigationLinks = (mobile = false) => (
    <nav className="flex w-full flex-col gap-1.5">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink key={item.path} to={item.path} end={item.end} onClick={mobile ? onClose : undefined}
            className={({ isActive }) => `flex w-full flex-row items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}>
            <Icon size={19} strokeWidth={1.9} />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="border-b border-slate-100 px-5 py-5">
          <Link to="/dashboard" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm"><ShoppingBag size={21} /></span>
            <span className="min-w-0"><span className="block text-base font-bold text-slate-900">StockWatch</span><span className="mt-0.5 block text-[11px] text-slate-500">Quick Commerce Monitor</span></span>
          </Link>
        </div>
        <div className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Main Menu</p>
          {navigationLinks()}
        </div>
        <div className="border-t border-slate-100 p-4">
          <div className="rounded-xl bg-slate-50 p-3.5">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><p className="text-xs font-semibold text-slate-700">Monitoring configured</p></div>
            <p className="mt-2 text-[11px] leading-5 text-slate-500">Automatic checks are controlled by your backend scheduler.</p>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" aria-label="Close navigation menu" onClick={onClose} className="absolute inset-0 h-full w-full bg-slate-900/40" />
          <aside className="absolute left-0 top-0 flex h-full w-72 max-w-[85vw] flex-col border-r border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
              <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white"><ShoppingBag size={19} /></span>
                <span><span className="block font-bold text-slate-900">StockWatch</span><span className="block text-[11px] text-slate-500">Quick Commerce Monitor</span></span>
              </Link>
              <button type="button" onClick={onClose} aria-label="Close menu" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={19} /></button>
            </div>
            <div className="flex-1 px-4 py-6"><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Main Menu</p>{navigationLinks(true)}</div>
            <div className="border-t border-slate-100 p-4 text-xs text-slate-500">Quick Commerce Stock Watcher</div>
          </aside>
        </div>
      )}
    </>
  );
}

export default Sidebar;
