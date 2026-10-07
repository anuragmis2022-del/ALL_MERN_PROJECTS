import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import Login from "../../Pages/Login";
import axios from "axios";
function Sidebar({ links }) {
const navigation=useNavigate()


  return (
    <div className="min-h-[calc(100vh-64px)] w-64 border-r border-slate-200 bg-white p-5">

      <p className="text-xs font-bold text-gray-400 mb-3">
        MANAGEMENT
      </p>

      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `block px-3 py-3 rounded-lg mb-1 ${
            isActive
              ? "bg-slate-950 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        ▦ &nbsp; {links[0].label}
      </NavLink>

      <NavLink
        to="/organizations"
        className={({ isActive }) =>
          `block px-3 py-3 rounded-lg mb-1 ${
            isActive
              ? "bg-slate-950 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        🏢 &nbsp; {links[1].label}
      </NavLink>

      <NavLink
        to="/administrators"
        className={({ isActive }) =>
          `block px-3 py-3 rounded-lg ${
            isActive
              ? "bg-slate-950 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`
        }
      >
        👤 &nbsp; {links[2].label}
      </NavLink>

<button onClick={()=>{

axios.get(import.meta.env.BACKEND_URL+ "/api/auth/logout", {withCredentials:true})
.then(res=>navigation("/Login"))

}}>Logout</button>




    </div>
  );
}

export default Sidebar;