import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { MdKeyboardArrowDown, MdDashboard, MdSettings } from "react-icons/md";

const Navbar = () => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const settings = useSelector((s) => s.settings ?? {});

  const societyName = settings.societyName || "My Society";
  const logo = settings.logo || null;
  const adminName = settings.admin?.name || "Admin";
  const adminPhoto = settings.admin?.photo || null;

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(adminName);

  return (
    <div className="h-16 w-full flex items-center justify-between px-6 bg-white shadow-sm border-b">
      {/* Left: Logo + Society Name */}
      <div className="flex items-center gap-3">
        {logo && (
          <img src={logo} alt="logo" className="h-10 w-10 object-contain" />
        )}
        <h1 className="text-xl font-semibold text-slate-800 tracking-wide">
          {societyName}
        </h1>
      </div>

      {/* Right: Admin Profile with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-md transition-all"
        >
          <div className="text-right">
            <div className="text-sm font-medium text-slate-800">
              {adminName}
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>

          {/* Admin Avatar */}
          {adminPhoto ? (
            <img
              src={adminPhoto}
              alt="admin"
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm border border-blue-700">
              {initials}
            </div>
          )}

          <MdKeyboardArrowDown
            className={`text-gray-500 transition-transform ${
              dropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50 py-1">
            <button
              onClick={() => {
                navigate("/");
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-3"
            >
              <MdDashboard size={18} />
              Dashboard
            </button>
            <button
              onClick={() => {
                navigate("/settings");
                setDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-t border-gray-200 flex items-center gap-3"
            >
              <MdSettings size={18} />
              Settings
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
