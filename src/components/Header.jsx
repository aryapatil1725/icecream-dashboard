import { Search, Bell, User, ChevronDown, LogOut, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Header({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Login');
  };

  const userInitials = user?.username 
    ? user.username.substring(0, 2).toUpperCase()
    : 'AD';

  return (
    <header className="bg-white/95 backdrop-blur-xl shadow-lg sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl hover:bg-brand-100 transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-brand-500" />
            <input
              type="text"
              placeholder="Search products, orders, customers..."
              className="w-96 pl-12 pr-4 py-3 bg-gradient-to-r from-brand-100 to-brand-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-brand-500/30 focus:border-brand-500 transition-all duration-300 placeholder-gray-500 font-medium"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-3 rounded-xl hover:bg-brand-100 transition-colors duration-200 group">
            <Bell className="w-5 h-5 text-gray-700 group-hover:text-brand-600 transition-colors duration-200" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-gradient-to-r from-brand-500 to-brand-600 rounded-full animate-pulse shadow-md"></span>
          </button>

          <div className="flex items-center gap-3 pl-4 border-l-2 border-gray-100">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">{user?.username || 'Admin'}</p>
              <p className="text-xs text-gray-600 font-semibold">Administrator</p>
            </div>
            <div className="relative">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold shadow-lg relative overflow-hidden">
                {userInitials}
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-brand-300 opacity-70" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gradient-to-br from-brand-300 to-brand-400 rounded-full border-2 border-white shadow-md"></span>
            </div>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-brand-100 transition-colors duration-200 group"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-700 group-hover:text-brand-600 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}