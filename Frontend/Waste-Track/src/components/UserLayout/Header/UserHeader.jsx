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
  const userData = JSON.parse(localStorage.getItem("ecoTrackCurrentUser"));;
  const userEmail = userData.email;
  const userInitial = userEmail.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("ecoTrackCurrentUser");
    localStorage.removeItem("ecoTrackCurrentUserEmail");
    // Navigate to login
    navigate("/login");
  };

  return (
    <header className="sticky top-0 bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow-md z-50">
      {/* Logo */}
      <Link to="/dashboard" className="text-xl font-extrabold tracking-wide">
        Eco<span className="text-yellow-400">Track</span>
      </Link>

      {/* Hamburger Icon - Mobile Only */}
      <button
        className="sm:hidden block z-50"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Menu className="w-6 h-6 text-white" />
        )}
      </button>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex gap-8 text-sm font-medium">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>
        <Link to="/collect-waste" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <Recycle className="w-4 h-4" />
          Collect Waste
        </Link>
        <Link to="/report-waste" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <FileText className="w-4 h-4" />
          Report Waste
        </Link>
        <Link to="/waste-timeline" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <History className="w-4 h-4" />
          Waste Timeline
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 hover:text-yellow-400 transition duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      {/* Desktop User Profile */}
      <div className="hidden sm:flex flex-col items-center ml-4">
        <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">
          {userInitial}
        </div>
        <p className="text-xs mt-1">{userEmail}</p>
      </div>

      {/* Mobile Fullscreen Menu */}
      <div
        className={`sm:hidden fixed inset-0 bg-green-600 text-white transform transition-transform duration-300 z-40 flex flex-col items-center justify-start pt-20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* User Profile in Mobile Menu */}
        <div className="flex items-center gap-3 mb-8 px-6 w-full max-w-xs">
          <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
            {userInitial}
          </div>
          <div className="text-left">
            <p className="font-medium">{userEmail}</p>
          </div>
        </div>

        <div className="w-full max-w-xs border-t border-green-500 mb-6"></div>

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col w-full max-w-xs gap-1">
          <Link 
            to="/dashboard" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link 
            to="/collect-waste" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <Recycle className="w-5 h-5" />
            Collect Waste
          </Link>
          <Link 
            to="/report-waste" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <FileText className="w-5 h-5" />
            Report Waste
          </Link>
          <Link 
            to="/waste-timeline" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <History className="w-5 h-5" />
            Waste Timeline
          </Link>
          <button 
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3 text-left"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}