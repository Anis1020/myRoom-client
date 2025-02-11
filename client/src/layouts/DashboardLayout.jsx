import { Outlet } from "react-router-dom";
import Container from "../components/Shared/Container";
import Sidebar from "../components/Dashboard/Sidebar/Sidebar";

const DashboardLayout = () => {
  return (
    <Container>
      <div className="relative min-h-screen md:flex">
        <div className="">
          <Sidebar></Sidebar>
        </div>

        {/* outlet */}
        <div className="flex-1 border md:ml-44">
          <Outlet />
        </div>
      </div>
    </Container>
  );
};

export default DashboardLayout;
