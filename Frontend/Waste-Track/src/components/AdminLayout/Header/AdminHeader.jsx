// frontend/src/components/AdminHeader.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  PieChart,
  Users,
  Recycle,
  FileText,
  LogOut,
} from "lucide-react";

export default function AdminHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const adminDataRaw = localStorage.getItem("ecoTrackCurrentAdmin");
  const adminData = adminDataRaw ? JSON.parse(adminDataRaw) : null;
  const adminEmail = adminData?.email || "Admin";
  const adminAvatar = adminData?.avatar_url || null;
  const adminInitial = adminEmail.charAt(0).toUpperCase();

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ecoTrackCurrentAdmin");
    localStorage.removeItem("adminAccessToken");
    localStorage.removeItem("adminRefreshToken");
    navigate("/admin-login");
  };

  const navLinks = [
    { name: "Analytics", path: "/analytics", icon: PieChart },
    { name: "User Management", path: "/user-management", icon: Users },
    { name: "Collected Waste", path: "/collected-waste", icon: Recycle },
    { name: "Reported Waste", path: "/reported-waste", icon: FileText },
  ];

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/analytics" className="flex-shrink-0 focus:outline-none">
            <h1 className="text-2xl font-bold text-green-600">WasteTrack</h1>
          </Link>

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

          <div className="hidden lg:flex items-center ml-4 space-x-2">
            {adminAvatar ? (
              <img
                src={adminAvatar}
                alt="Admin Avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                {adminInitial}
              </div>
            )}
            <span className="text-sm text-gray-700">{adminEmail}</span>
          </div>

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

      {isOpen && (
        <div className="lg:hidden bg-white/80 backdrop-blur-md shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="flex items-center space-x-3 px-3 py-2 border-b border-gray-200 mb-2">
              {adminAvatar ? (
                <img
                  src={adminAvatar}
                  alt="Admin Avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                  {adminInitial}
                </div>
              )}
              <span className="text-sm text-gray-700">{adminEmail}</span>
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