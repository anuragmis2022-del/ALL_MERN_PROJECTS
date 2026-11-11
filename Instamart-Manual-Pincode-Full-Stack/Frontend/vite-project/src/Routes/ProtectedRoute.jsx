import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  // Read the current login information from Redux.
  const { user, loading } = useSelector((state) => state.user);

  // Wait until App.jsx finishes checking the backend session.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        Checking administrator session...
      </div>
    );
  }

  // If there is no user, send them to the login page.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the admin is logged in, show the child route.
  return <Outlet />;
}

export default ProtectedRoute;
