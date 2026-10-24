import { BACKEND_URL } from "../../Utils/api.jsx";

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUserData } from "../../Utils/Redux/UserSlice";

function Sidebar({ links = [] }) {
  const navigation = useNavigate();
  const dispatch = useDispatch();

  const logout = () => {
    axios
      .post(
        BACKEND_URL + "/api/auth/logout",
        {},
        { withCredentials: true }
      )
      .then((res) => {
        console.log("LOGOUT SUCCESS:", res.data);
        dispatch(addUserData(null));
        navigation("/login");
      })
      .catch((error) => {
        console.log("LOGOUT ERROR:", error);
      });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white p-5">
      <p className="text-xs font-bold text-gray-400 mb-3">
        MANAGEMENT
      </p>

      {links.map((link) => {
        const Icon = link.icon;

        return (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-lg mb-1 ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {Icon && <Icon size={18} />}
            {link.label}
          </NavLink>
        );
      })}

      <button
        onClick={logout}
        className="w-full text-left px-3 py-3 mt-5 rounded-lg text-red-500 hover:bg-red-50"
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
