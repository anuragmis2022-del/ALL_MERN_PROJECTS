import React from "react";
import { useSelector } from "react-redux";

function Navbar() {
  const user = useSelector((store) => store.user);

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left - Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-md"></div>
        </div>

        <div>
          <h1 className="text-sm font-bold text-gray-900">TeamFlow</h1>

          <p className="text-xs text-gray-400">Owner Workspace</p>
        </div>
      </div>

      {/* Middle - Search */}
      {["owner", "admin"].includes(user.role) && (
        <div className="w-96">
          <input
            type="text"
            placeholder={user.role == "owner"?"Search Organization..." :"Search Employee "}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>
      )}   

      {/* Right - User */}
      <div className="flex items-center gap-4">
        <div className="text-gray-500">🔔</div>

        <div className="w-px h-7 bg-gray-200"></div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold">
            {user.name.slice(0,1)}
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-800">{user.name}</p>

            <p className="text-xs text-gray-400">{user.role}</p>
          </div>

          <span className="text-gray-400">▼</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
