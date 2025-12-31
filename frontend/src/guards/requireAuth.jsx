import { Navigate } from "react-router-dom";

function RequireAuth({ children }) {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    return <Navigate to="/authentication" replace />;
  }

  return children;
}

export default RequireAuth;
