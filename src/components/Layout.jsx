import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="app-bg">
      <main className="main-container">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;