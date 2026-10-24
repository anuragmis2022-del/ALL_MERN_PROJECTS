
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Search } from "lucide-react";

function Navbar({ onSearch }) {
  const user = useSelector((store) => store.user);
  const [search, setSearch] = useState("");

  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";
  const showSearch = isOwner || isAdmin;

  // Clear the search input when the user role changes.
  useEffect(() => {
    setSearch("");
    if (onSearch) onSearch("");
  }, [user?.role]);

  const handleSearch = (e) => {
    e.preventDefault();

    if (onSearch) {
      onSearch(search.trim());
    }
  };

  return (
    <header className="min-h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-6 gap-4">
      {/* Logo and workspace */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 bg-slate-950 rounded-xl flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-md" />
        </div>

        <div>
          <h1 className="text-sm font-bold text-gray-900">
            TeamFlow
          </h1>

          <p className="text-xs text-gray-400">
            {isOwner
              ? "Owner Workspace"
              : isAdmin
              ? "Admin Workspace"
              : "Employee Workspace"}
          </p>
        </div>
      </div>

      {/* Search: Owner and Admin only */}
      {showSearch && (
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 flex-1 max-w-md"
        >
          <input
            type="search"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);

              // Update results while typing.
              if (onSearch) onSearch(value.trim());
            }}
            placeholder={
              isOwner
                ? "Search organizations..."
                : "Search employees..."
            }
            className="min-w-0 flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400"
          />

          <button
            type="submit"
            aria-label="Search"
            className="flex items-center gap-2 bg-slate-950 text-white rounded-lg px-3 py-2 text-sm hover:bg-slate-800"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      )}

      {/* Logged-in user */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="w-px h-7 bg-gray-200" />

        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
          {user?.name?.slice(0, 1)?.toUpperCase() || "U"}
        </div>

        <div className="hidden sm:block">
          <p className="text-xs font-semibold text-gray-800">
            {user?.name || "User"}
          </p>

          <p className="text-xs text-gray-400 capitalize">
            {user?.role || "User"}
          </p>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
