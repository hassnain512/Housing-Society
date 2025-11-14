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
    { name: "Map View", path: "/map", icon: <MdMap /> },
    { name: "Re-Acquisition", path: "/reacquisition", icon: <MdSwapHoriz /> },
    { name: "Reports", path: "/reports", icon: <MdBarChart /> },
    { name: "Settings", path: "/settings", icon: <MdSettings /> },
  ];

  // Get current page name
  const currentPage =
    menuItems.find((item) => item.path === location.pathname)?.name ||
    "Dashboard";

  return (
    <div
      className={`bg-linear-to-b from-slate-900 to-slate-800 text-gray-300 h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col justify-between overflow-y-hidden z-50 border-r border-slate-700
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Top - Logo + Toggle */}
      <div>
        <div
          className={`flex items-center ${
            isOpen ? "justify-between px-4" : "justify-center px-0"
          } py-5 border-b border-slate-700`}
        >
          {isOpen && (
            <h1 className="text-lg font-bold text-white tracking-wide">
              {currentPage}
            </h1>
          )}
          <button
            onClick={() => onToggle(!isOpen)}
            className="text-gray-400 text-xl p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <MdMenu />
          </button>
        </div>

        {/* Menu */}
        <ul className="mt-6 space-y-2 px-3">
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center ${
                    isOpen ? "gap-4 px-4" : "justify-center px-0"
                  } py-3 rounded-lg text-sm font-semibold transition-all
                  ${
                    active
                      ? "bg-linear-to-r from-indigo-600 to-blue-600 text-white shadow-lg"
                      : "text-gray-400 hover:bg-slate-700/50 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {isOpen && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 py-4 border-t border-slate-700">
        <p>© 2025 Housing</p>
      </div>
    </div>
  );
};

export default Sidebar;
