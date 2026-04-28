import { Navigate } from "react-router-dom";

export default function CustomerProtectedRoute({ children }) {
  const customerEmail = localStorage.getItem("customerEmail");
  
  if (!customerEmail) {
    return <Navigate to="/Login" replace />;
  }
  
  return children;
}