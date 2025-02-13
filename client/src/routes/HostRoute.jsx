import { Navigate } from "react-router-dom";
import LoadingSpinner from "../components/Shared/LoadingSpinner";
import useUserRoll from "../hooks/useUserRoll";

const HostRoute = ({ children }) => {
  const [role, isLoading] = useUserRoll();

  if (isLoading) return <LoadingSpinner />;

  if (role === "host") return children;

  return <Navigate to={"/dashboard"}></Navigate>;
};

export default HostRoute;
