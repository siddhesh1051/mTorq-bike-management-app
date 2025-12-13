import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail } from "lucide-react";
import { toast } from "sonner";

const Settings = ({ onLogout }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    toast.success("Logged out successfully");
    onLogout();
  };

  return (
    <div className="p-4 md:p-8 space-y-6" data-testid="settings-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
          Settings
        </h1>
        <p className="text-zinc-400 mt-2">Manage your account</p>
      </div>

      {/* User Info */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-white">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded border border-white/5">
            <div className="w-12 h-12 rounded-full bg-[#ccfbf1]/20 flex items-center justify-center">
              <User className="w-6 h-6 text-[#ccfbf1]" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Name
              </div>
              <div className="text-white font-medium">{user.name || "User"}</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-zinc-900/50 rounded border border-white/5">
            <div className="w-12 h-12 rounded-full bg-[#ccfbf1]/20 flex items-center justify-center">
              <Mail className="w-6 h-6 text-[#ccfbf1]" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Email
              </div>
              <div className="text-white font-medium font-mono text-sm">
                {user.email || "email@example.com"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-white">Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            data-testid="logout-button"
            onClick={handleLogout}
            className="w-full h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 hover:border-red-500/50 font-semibold transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-heading text-white">About</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-zinc-400 text-sm">
          <p>Bike Expense Tracker v1.0</p>
          <p>Track and manage all your bike-related expenses in one place.</p>
          <p className="text-zinc-600 text-xs mt-4">© 2024 Bike Budget. All rights reserved.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;