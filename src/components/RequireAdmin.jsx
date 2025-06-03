import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireAdmin = () => {
  const { auth } = useAuth();

  if (!auth?.user || auth?.user.role !== "dealer") {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
