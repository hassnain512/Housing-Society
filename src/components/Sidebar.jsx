import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdSpaceDashboard,
  MdPeople,
  MdOutlineLandscape,
  MdBookOnline,
  MdShoppingCart,
  MdAttachMoney,
  MdMap,
  MdSwapHoriz,
  MdBarChart,
  MdSettings,
  MdMenu,
} from "react-icons/md";

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Auto-close sidebar on small screens
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    if (windowWidth < 768) onToggle(false); // close sidebar on small screens
    return () => window.removeEventListener("resize", handleResize);
  }, [windowWidth, onToggle]);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <MdSpaceDashboard /> },
    { name: "Customers", path: "/customers", icon: <MdPeople /> },
    { name: "Plots", path: "/plots", icon: <MdOutlineLandscape /> },
    { name: "Booking", path: "/booking", icon: <MdBookOnline /> },
    { name: "Plans", path: "/plans", icon: <MdShoppingCart /> },
    { name: "Installments", path: "/installments", icon: <MdAttachMoney /> },
    { name: "Map View", path: "/map", icon: <MdMap /> },
    { name: "Re-Acquisition", path: "/reacquisition", icon: <MdSwapHoriz /> },
    { name: "Reports", path: "/reports", icon: <MdBarChart /> },
    { name: "Settings", path: "/settings", icon: <MdSettings /> },
  ];

  return (
    <div
      className={`bg-[#0b1437] text-gray-300 h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col justify-between overflow-y-hidden z-50
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Top - Logo + Toggle */}
      <div>
        <div
          className={`flex items-center ${
            isOpen ? "justify-between px-4" : "justify-center px-0"
          } py-4 border-b border-gray-700`}
        >
          {isOpen && (
            <h1 className="text-xl font-semibold text-white tracking-wide">
              Dashboard
            </h1>
          )}
          <button
            onClick={() => onToggle(!isOpen)}
            className="text-gray-300 text-xl p-2 hover:bg-gray-700 rounded-md"
          >
            <MdMenu />
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-4 space-y-1 px-2">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    isOpen ? "gap-4 px-3" : "justify-center px-0"
                  } py-3 rounded-md text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-[#1e2a5a] hover:text-white"
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-700">
        <p>© 2025 Dashboard</p>
      </div>
    </div>
  );
};

export default Sidebar;
