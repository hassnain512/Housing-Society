import { useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  // Convert path → Title
  const pageTitle =
    location.pathname === "/"
      ? "Dashboard"
      : location.pathname.replace("/", "").replace("-", " ");

  const formattedTitle =
    pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1);

  return (
    <div className="h-16 w-full flex items-center justify-between px-6 bg-white shadow-sm border-b">
      {/* Page Title */}
      <h1 className="text-xl font-semibold text-slate-800 tracking-wide">
        {formattedTitle}
      </h1>

      {/* Admin Profile */}
      <div className="flex items-center gap-3 cursor-pointer">
        <span className="text-sm text-gray-600 font-medium">Admin</span>

        {/* Admin Avatar Icon */}
        <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
          A
        </div>
      </div>
    </div>
  );
};

export default Navbar;
