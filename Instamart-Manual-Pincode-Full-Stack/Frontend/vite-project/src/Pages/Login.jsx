
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-100 flex items-center justify-center p-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-8">

        {/* Logo and heading */}
        <div className="flex flex-col items-center mb-8">

          <div className="bg-blue-600 p-4 rounded-2xl mb-4">
            <ShoppingBag className="text-white" size={32} />
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Quick Commerce
          </h1>

          <p className="text-gray-500 mt-2">
            Administrator Login
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
          className="space-y-5"
        >

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>

            <div className="flex items-center border rounded-lg px-3 focus-within:border-blue-500">
              <Mail size={18} className="text-gray-400" />

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>

            <div className="flex items-center border rounded-lg px-3 focus-within:border-blue-500">
              <LockKeyhole size={18} className="text-gray-400" />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center">
              {error}
            </p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          Quick Commerce Stock Watcher
        </p>

      </div>
    </div>
  );
}

export default Login;
