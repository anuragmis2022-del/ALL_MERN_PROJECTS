import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { addUserData } from "../Utils/Redux/UserSlice";
import Loading from "../Pages/Loading";

function ProtectedRoutes() {
  const dispatch = useDispatch();

  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await axios.get(
          import.meta.env.VITE_BACKEND_URL + "/api/auth/me",
          {
            withCredentials: true,
          },
        );

        dispatch(addUserData(res.data.data));

        setLoggedIn(true);
      } catch (error) {
        dispatch(addUserData(null));

        setLoggedIn(false);
      }

      setChecking(false);
    };

    checkLogin();
  }, [dispatch]);

  if (checking) {
    return <Loading />;
  }

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
