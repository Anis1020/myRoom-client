import { Navigate } from "react-router-dom";
// import useAuth from "../hooks/useAuth";
import LoadingSpinner from "../components/Shared/LoadingSpinner";
import useUserRoll from "../hooks/useUserRoll";

const AdminRoute = ({ children }) => {
  //   const { user, loading } = useAuth();
  const [role, isLoading] = useUserRoll();

  if (isLoading) return <LoadingSpinner />;

  if (role === "admin") return children;

  return <Navigate to={"/dashboard"}></Navigate>;
};

export default AdminRoute;
