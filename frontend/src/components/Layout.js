import { Link, useLocation } from "react-router-dom";
import { Home, Plus, List, Bike, Settings } from "lucide-react";

const Layout = ({ children, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/add-expense", icon: Plus, label: "Add" },
    { path: "/expenses", icon: List, label: "Expenses" },
    { path: "/bikes", icon: Bike, label: "Bikes" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-50">
        <div className="flex items-center justify-around h-16 max-w-2xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors duration-200 ${
                  isActive
                    ? "text-[#ccfbf1]"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;