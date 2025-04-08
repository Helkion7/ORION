import { Outlet } from "react-router-dom";
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import ResponseNotification from "./ResponseNotification";
// Remove ApiProgress import temporarily
// import ApiProgress from "./ApiProgress";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-container">
      <Navbar onMenuToggle={handleToggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="content-container">
        <Outlet />
      </div>
      <ResponseNotification />
      {/* Remove ApiProgress until it's fixed */}
      {/* <ApiProgress /> */}
    </div>
  );
};

export default Layout;
