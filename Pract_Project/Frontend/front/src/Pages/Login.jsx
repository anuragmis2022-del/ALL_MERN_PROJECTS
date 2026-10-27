import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { addUserData } from "../Utils/Redux/UserSlice";
import Dashboard from "./Dashboard";

function Login() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">TeamFlow Login</h1>

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
          className="w-full border p-2 rounded mb-4"
        />

        <label>Password</label>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          className="w-full border p-2 rounded mb-3"
        />

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={showPassword}
            onChange={(e) => {
              setShowPassword(e.target.checked);
            }}
          />

          <span>Show Password</span>
        </div>

        <button
          type="button"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
          onClick={async () => {
            if (!email || !password) {
              toast.error("Please enter email and password");
              return;
            }

            setLoading(true);

            try {
              const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/auth/login",
                {
                  email: email,
                  password: password,
                },
                {
                  withCredentials: true,
                },
              );

              dispatch(addUserData(res.data.data));

              nav("/Dashboard");
            } catch (error) {
              toast.error("Invalid Credentials");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Login;
