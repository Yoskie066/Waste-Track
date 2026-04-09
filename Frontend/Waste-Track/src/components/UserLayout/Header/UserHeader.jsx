import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LayoutDashboard,
  Recycle,
  FileText,
  History,
  LogOut,
} from "lucide-react";

export default function UserHeader() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Get user data from localStorage (safe)
  const userDataRaw = localStorage.getItem("ecoTrackCurrentUser");
  const userData = userDataRaw ? JSON.parse(userDataRaw) : null;
  const userEmail = userData?.email || "Guest";
  const userInitial = userEmail.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ecoTrackCurrentUser");
    localStorage.removeItem("ecoTrackCurrentUserEmail");
    navigate("/login");
  };

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Collect Waste", path: "/collect-waste", icon: Recycle },
    { name: "Report Waste", path: "/report-waste", icon: FileText },
    { name: "Waste Timeline", path: "/waste-timeline", icon: History },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex-shrink-0 focus:outline-none">
            <h1 className="text-2xl font-bold text-green-600">WasteTrack</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                to={path}
                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition"
              >
                <Icon size={20} />
                <span>{name}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Desktop User Profile */}
          <div className="hidden lg:flex items-center ml-4 space-x-2">
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
              {userInitial}
            </div>
            <span className="text-sm text-gray-700">{userEmail}</span>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600 focus:outline-none p-2"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu (glassmorphism) */}
      {isOpen && (
        <div className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* User profile in mobile menu */}
            <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 mb-2">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                {userInitial}
              </div>
              <span className="text-sm text-gray-700">{userEmail}</span>
            </div>
            {navLinks.map(({ name, path, icon: Icon }) => (
              <Link
                key={name}
                to={path}
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-green-600 transition text-base w-full text-left rounded-md hover:bg-white/30"
                onClick={() => setIsOpen(false)}
              >
                <Icon size={20} />
                <span>{name}</span>
              </Link>
            ))}
            <button
              onClick={() => {
                setIsOpen(false);
                handleLogout();
              }}
              className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-green-600 transition text-base w-full text-left rounded-md hover:bg-white/30"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}