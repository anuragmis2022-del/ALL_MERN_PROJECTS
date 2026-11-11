import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { Menu, ClipboardList, UserCircle, ShoppingBag, LogOut } from "lucide-react";
import { addCase } from "../Utils/UserSlice";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const AUTH_URL = `${API_BASE_URL}/auth`;

function Navbar({ onMenuClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const pageTitles = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/products": "Products",
    "/price-history": "Price History",
    "/monitoring-logs": "Monitoring Logs",
  };
  const currentTitle = pageTitles[location.pathname] || "Dashboard";

  // Ask the backend to clear the login cookie, then clear Redux too.
  async function handleLogout() {
    try {
      await axios.post(`${AUTH_URL}/logout`, {}, { withCredentials: true });
    } catch (error) {
      // Clear local login data even if the backend request fails.
      console.error("Logout request failed:", error);
    } finally {
      dispatch(addCase({ user: null, loading: false }));
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
        >
          <Menu size={21} />
        </button>

        <Link to="/dashboard" className="flex items-center gap-2 md:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
            <ShoppingBag size={19} />
          </span>
          <span className="text-base font-bold text-slate-900">StockWatch</span>
        </Link>

        <div className="hidden min-w-0 md:block">
          <h1 className="m-0 text-base font-semibold leading-5 text-slate-900">
            {currentTitle}
          </h1>
          <p className="mt-1 text-xs text-slate-500">Quick Commerce Stock Watcher</p>
        </div>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4">
        <Link
          to="/monitoring-logs"
          aria-label="Open monitoring activity"
          title="Monitoring activity"
          className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
        >
          <ClipboardList size={19} />
        </Link>

        <span className="hidden h-8 w-px bg-slate-200 sm:block" />

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-700">
            <UserCircle size={23} />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-5 text-slate-800">Administrator</p>
            <p className="text-xs text-slate-500">{user?.email || "Secure workspace"}</p>
          </div>
        </div>

        <button
          type="button"
          title="Logout"
          aria-label="Logout"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={17} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
