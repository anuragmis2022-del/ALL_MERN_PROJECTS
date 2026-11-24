
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { addCase } from "../Utils/UserSlice";
import { LockKeyhole, Mail, ShoppingBag } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">

      {/* LEFT SIDE - BRANDING */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-blue-800 p-12 xl:p-16 text-white">

        {/* Background decorative circles */}
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-indigo-400/10 blur-3xl"></div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/10 border border-white/20 p-3 rounded-xl">
            <ShoppingBag size={27} className="text-white" />
          </div>

          <span className="text-xl font-bold tracking-wide">
            InstaMart Stock Watcher
          </span>
        </div>

        {/* Main content */}
        <div className="relative z-10 max-w-xl">

          <p className="text-blue-300 text-sm font-semibold uppercase tracking-[3px] mb-5">
            Smart Product Monitoring
          </p>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
            Monitor Prices.
            <br />
            Track Availability.
            <br />
            Stay Informed.
          </h1>

          <p className="text-blue-100/75 text-lg leading-8 mb-10">
            Keep track of your Instamart products with automated
            price checks, stock monitoring, and real-time activity updates.
          </p>

          {/* Feature cards */}
          <div className="space-y-4">

            <div className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-xl p-4">
              <div className="bg-blue-400/20 p-3 rounded-lg">
                <ShoppingBag size={22} className="text-blue-200" />
              </div>

              <div>
                <h3 className="font-semibold">Product Monitoring</h3>
                <p className="text-sm text-blue-100/60 mt-1">
                  Keep track of your saved products.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 border border-white/10 rounded-xl p-4">
              <div className="bg-blue-400/20 p-3 rounded-lg">
                <LockKeyhole size={22} className="text-blue-200" />
              </div>

              <div>
                <h3 className="font-semibold">Secure Administration</h3>
                <p className="text-sm text-blue-100/60 mt-1">
                  Manage your monitoring dashboard securely.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-sm text-blue-100/50">
          InstaMart Stock Watcher · Administrator Portal
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN */}
      <div className="flex items-center justify-center p-5 sm:p-10 lg:p-12">

        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-10">
            <div className="bg-blue-600 p-3 rounded-xl">
              <ShoppingBag size={25} className="text-white" />
            </div>

            <span className="text-lg font-bold text-slate-800">
              InstaMart Stock Watcher
            </span>
          </div>

          {/* Login heading */}
          <div className="mb-9">

            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-3">
              Welcome Back
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              Administrator Login
            </h2>

            <p className="text-slate-500 mt-3 leading-6">
              Sign in to access your product monitoring dashboard.
            </p>

          </div>

          {/* Login form */}
          <form
            onSubmit={async (event) => {
              event.preventDefault();

              setError("");
              setLoading(true);

              try {
                const response = await axios.post(
                  `${API_BASE_URL}/auth/login`,
                  { email, password },
                  { withCredentials: true }
                );

                dispatch(
                  addCase({
                    user: response.data.user,
                    loading: false,
                  })
                );

                navigate("/dashboard", { replace: true });

              } catch (error) {
                setError(
                  error.response?.data?.message || "Login failed"
                );
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-6"
          >

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <Mail size={19} className="text-slate-400" />

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="w-full p-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>

              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
                <LockKeyhole size={19} className="text-slate-400" />

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  className="w-full p-4 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p className="text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-center">
                {error}
              </p>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in to Dashboard"}
            </button>

          </form>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              InstaMart Stock Watcher
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Secure Administrator Access
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Login;
