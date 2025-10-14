import { Navigate, useLocation } from "react-router-dom";
import { useApp } from "@/context/AppContext";

interface ProtectedRouteProps {
  children: JSX.Element;
  adminOnly?: boolean;
}

export default function ProtectedRoute({ children, adminOnly = false }: ProtectedRouteProps) {
  const { user } = useApp();
  const loc = useLocation();
  
  if (!user.role) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}
