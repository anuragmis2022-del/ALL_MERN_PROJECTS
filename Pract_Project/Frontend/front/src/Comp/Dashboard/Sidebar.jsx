
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";

import { BACKEND_URL } from "../../Utils/api.jsx";
import { addUserData } from "../../Utils/Redux/UserSlice";

function Sidebar({ links = [] }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Logout function
  async function logout() {
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      console.log("LOGOUT SUCCESS:", res.data);

      // Clear logged-in user data from Redux
      dispatch(addUserData(null));

      // Go to login page
      navigate("/login");
    } catch (error) {
      console.log("LOGOUT ERROR:", error);
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white p-5">

      <p className="mb-3 text-xs font-bold text-gray-400">
        MANAGEMENT
      </p>

      {/* Display all sidebar links */}
      {links.map((link) => {
        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => {
              if (isActive) {
                return "mb-1 flex items-center gap-3 rounded-lg bg-slate-950 px-3 py-3 text-white";
              }

              return "mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-gray-600 hover:bg-gray-100";
            }}
          >
            {/* Display icon if provided */}
            {link.icon && <link.icon size={18} />}

            {/* Display link name */}
            {link.label}
          </NavLink>
        );
      })}

      {/* Logout button */}
      <button
        onClick={logout}
        className="mt-5 w-full rounded-lg px-3 py-3 text-left text-red-500 hover:bg-red-50"
      >
        Logout
      </button>

    </div>
  );
}

export default Sidebar;
