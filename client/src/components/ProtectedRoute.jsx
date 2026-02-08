import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

export default function ProtectedRoute({ children, allowedRole }) {
  const { user } = useContext(AppContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" />;
  }

  return children;
}
