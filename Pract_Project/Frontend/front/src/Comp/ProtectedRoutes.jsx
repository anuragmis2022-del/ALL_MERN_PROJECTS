import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import api from "../Utils/api";
import { addUserData } from "../Utils/Redux/UserSlice";
import Loading from "../Pages/Loading";

const ProtectedRoutes = () => {
  const userData = useSelector((store) => store.user);
  const dispatch = useDispatch();

  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (userData) return;

    api
      .get("/api/auth/me")
      .then((res) => {
        console.log("ME SUCCESS:", res.data);

        dispatch(addUserData(res.data.data));
      })
      .catch((error) => {
        console.log("ME ERROR:", error);
        console.log("ME ERROR RESPONSE:", error.response?.data);

        setFailed(true);
      });
  }, [userData, dispatch]);

  // if (failed) {
  //   return <Navigate to="/Login" replace />;
  // }

  // if (!userData) {
  //   return <Loading />;
  // }

  return <Outlet />;
};

export default ProtectedRoutes;