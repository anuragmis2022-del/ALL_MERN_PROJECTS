import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import api from "../Utils/api";
import { addUserData } from "../Utils/Redux/UserSlice";
import Loading from "../Pages/Loading";

export default function ProtectedRoutes() {
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    api.get("/api/auth/me")
      .then((res) => {
        dispatch(addUserData(res.data.data));
        setLoggedIn(true);
      })
      .catch(() => {
        dispatch(addUserData(null));
        setLoggedIn(false);
      })
      .finally(() => setChecking(false));
  }, [dispatch]);

  if (checking) return <Loading />;
  if (!loggedIn) return <Navigate to="/login" replace />;
  return <Outlet />;
}
