import { Navigate } from "react-router-dom";

function RedirectIfAuth({ children }) {
  const userId = localStorage.getItem("user_id");

  if (userId) {
    return <Navigate to="/feed" replace />;
  }

  return children;
}

export default RedirectIfAuth;
