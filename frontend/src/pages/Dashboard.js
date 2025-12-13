import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, TrendingUp, Bike, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-zinc-400">Loading dashboard...</div>
      </div>
    );
  }

  const categoryColors = {
    Fuel: "#60a5fa",
    Service: "#f87171",
    Insurance: "#4ade80",
    Other: "#fbbf24",
  };

  return (
    <div className="p-4 md:p-8 space-y-8" data-testid="dashboard">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
          Dashboard
        </h1>
        <p className="text-zinc-400 mt-2">Track your bike expenses at a glance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Expenses */}
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Total Expenses
            </CardTitle>
            <IndianRupee className="w-5 h-5 text-[#ccfbf1]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-white" data-testid="total-expenses">
              ₹{stats?.total_expenses?.toLocaleString('en-IN') || 0}
            </div>
          </CardContent>
        </Card>

        {/* Total Bikes */}
        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">
              Total Bikes
            </CardTitle>
            <Bike className="w-5 h-5 text-[#ccfbf1]" strokeWidth={1.5} />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-mono font-bold text-white" data-testid="total-bikes">
              {stats?.total_bikes || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#ccfbf1]" strokeWidth={1.5} />
            Category Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.category_breakdown &&
          Object.keys(stats.category_breakdown).length > 0 ? (
            <div className="space-y-4" data-testid="category-breakdown">
              {Object.entries(stats.category_breakdown).map(([category, amount]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300 font-medium">{category}</span>
                    <span className="font-mono font-bold text-white">
                      ₹{amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(amount / stats.total_expenses) * 100}%`,
                        backgroundColor: categoryColors[category] || "#fbbf24",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 text-center py-8">
              No expenses recorded yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Expenses */}
      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle className="text-xl font-heading font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#ccfbf1]" strokeWidth={1.5} />
            Recent Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_expenses && stats.recent_expenses.length > 0 ? (
            <div className="space-y-3" data-testid="recent-expenses">
              {stats.recent_expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-zinc-900/50 rounded border border-white/5 hover:border-white/10 transition-colors duration-200"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{expense.type}</div>
                    <div className="text-sm text-zinc-500 font-mono">
                      {format(new Date(expense.date), 'dd MMM yyyy')}
                    </div>
                  </div>
                  <div className="font-mono font-bold text-[#ccfbf1]">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 text-center py-8">
              No recent expenses
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;