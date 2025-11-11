import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Navbar from "../components/Navbar.jsx";
import { useState } from "react";

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen w-full">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={setSidebarOpen} />

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-20"
        }`}
      >
        {/* Navbar */}
        <Navbar />

        {/* Page Content Area */}
        <div className="flex-1 overflow-auto p-6" style={{ backgroundColor: "#F7FAFF" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Layout;
