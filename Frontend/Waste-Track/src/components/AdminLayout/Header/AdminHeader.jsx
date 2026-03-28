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
  // Get admin data from localStorage
  const adminData = JSON.parse(localStorage.getItem("ecoTrackCurrentAdmin"));
  const adminEmail = adminData.email;
  const adminInitial = adminEmail.charAt(0).toUpperCase();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ecoTrackCurrentAdmin");
    localStorage.removeItem("ecoTrackCurrentAdminEmail");
    navigate("/admin-login"); 
  };

  return (
    <header className="sticky top-0 bg-green-600 text-white px-6 py-3 flex justify-between items-center shadow-md z-50">
      {/* Logo - links to /admin which will show Analytics as default */}
      <Link to="/analytics" className="text-xl font-extrabold tracking-wide">
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
        <Link to="/analytics" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <PieChart className="w-4 h-4" />
          Analytics
        </Link>
        <Link to="/user-management" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <Users className="w-4 h-4" />
          User Management
        </Link>
        <Link to="/collected-waste" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <Recycle className="w-4 h-4" />
          Collected Waste
        </Link>
        <Link to="/reported-waste" className="flex items-center gap-1 hover:text-yellow-400 transition duration-200">
          <FileText className="w-4 h-4" />
          Reported Waste
        </Link>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-1 hover:text-yellow-400 transition duration-200"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>

      {/* Desktop Admin Profile */}
      <div className="hidden sm:flex flex-col items-center ml-4">
        <div className="w-8 h-8 bg-white text-green-600 rounded-full flex items-center justify-center font-bold">
          {adminInitial}
        </div>
        <p className="text-xs mt-1">{adminEmail}</p>
      </div>

      {/* Mobile Fullscreen Menu */}
      <div
        className={`sm:hidden fixed inset-0 bg-green-600 text-white transform transition-transform duration-300 z-40 flex flex-col items-center justify-start pt-20 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Admin Profile in Mobile Menu */}
        <div className="flex items-center gap-3 mb-8 px-6 w-full max-w-xs">
          <div className="w-10 h-10 bg-white text-green-600 rounded-full flex items-center justify-center font-bold text-lg">
            {adminInitial}
          </div>
          <div className="text-left">
            <p className="font-medium">{adminEmail}</p>
          </div>
        </div>

        <div className="w-full max-w-xs border-t border-green-500 mb-6"></div>

        {/* Mobile Navigation Links */}
        <nav className="flex flex-col w-full max-w-xs gap-1">
          <Link 
            to="/analytics" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <PieChart className="w-5 h-5" />
            Analytics
          </Link>
          <Link 
            to="/user-management" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <Users className="w-5 h-5" />
            User Management
          </Link>
          <Link 
            to="/collected-waste" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <Recycle className="w-5 h-5" />
            Collected Waste
          </Link>
          <Link 
            to="/reported-waste" 
            onClick={() => setIsOpen(false)} 
            className="py-3 px-4 hover:bg-green-700 rounded flex items-center gap-3"
          >
            <FileText className="w-5 h-5" />
            Reported Waste
          </Link>
          <button 
            onClick={handleLogout} 
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