import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import api from "../Utils/api";
import { addUserData } from "../Utils/Redux/UserSlice";
import Loading from "../Pages/Loading";

export default function ProtectedRoutes() {
  const userData = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const [checking, setChecking] = useState(!userData);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (userData) {
      setChecking(false);
      setFailed(false);
      return;
    }

    let cancelled = false;
    setChecking(true);

    api.get("/api/auth/me")
      .then((res) => {
        if (!cancelled) {
          dispatch(addUserData(res.data.data));
        }
      })
      .catch((error) => {
        console.error(
          "Session verification failed:",
          error.response?.data || error.message
        );

        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userData, dispatch]);

  if (checking && !userData) return <Loading />;
  if (failed && !userData) return <Navigate to="/login" replace />;
  if (!userData) return <Loading />;

  return <Outlet />;
}
