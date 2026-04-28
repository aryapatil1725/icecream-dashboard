import { useNavigate, useLocation } from "react-router-dom";
import {
  IceCream,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Settings,
  X,
  TrendingUp,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Package, label: "Products", path: "/products" },
  { icon: ShoppingCart, label: "Orders", path: "/orders" },
  { icon: Users, label: "Customers", path: "/customers" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
];

export default function Sidebar({ open = true, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } sm:hidden`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform flex-col bg-gradient-to-b from-white via-brand-50/30 to-white border-r border-gray-100 transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center shadow-lg">
              <IceCream className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Ice Admin
              </h1>
              <p className="text-xs text-gray-500">Dashboard v2.0</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors duration-200 sm:hidden"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => {
                  navigate(path);
                  onClose?.();
                }}
                className={`w-full flex items-center gap-3 rounded-2xl px-5 py-3.5 text-left transition-all duration-300 group ${
                  isActive
                    ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${
                    isActive ? "text-white" : "text-gray-500 group-hover:text-brand-600"
                  }`}
                />
                <span className={`font-medium ${isActive ? "text-white" : ""}`}>{label}</span>
                {isActive && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 rounded-full bg-white shadow-lg animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-100/50">
          {/* Stats Card */}
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-5 text-white shadow-lg mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium opacity-90">This Week</p>
                <p className="text-2xl font-bold">+24.5%</p>
              </div>
            </div>
            <p className="text-xs opacity-80">Sales increased compared to last week</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold">
                AM
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Ava Martinez</p>
              <p className="text-xs text-gray-500 truncate">Administrator</p>
            </div>
            <Settings className="w-5 h-5 text-gray-400 hover:text-brand-600 transition-colors duration-200" />
          </div>
        </div>
      </aside>
    </>
  );
}