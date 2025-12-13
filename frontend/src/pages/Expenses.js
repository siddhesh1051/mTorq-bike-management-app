import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, Edit, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterBike, setFilterBike] = useState("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    bike_id: "",
    type: "",
    amount: "",
    date: "",
    odometer: "",
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [expensesRes, bikesRes] = await Promise.all([
        axios.get(`${API}/expenses`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/bikes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setExpenses(expensesRes.data);
      setBikes(bikesRes.data);
    } catch (error) {
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      bike_id: expense.bike_id,
      type: expense.type,
      amount: expense.amount.toString(),
      date: expense.date,
      odometer: expense.odometer?.toString() || "",
      notes: expense.notes || "",
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        odometer: formData.odometer ? parseInt(formData.odometer) : null,
      };

      await axios.put(`${API}/expenses/${editingExpense.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Expense updated successfully!");
      setEditDialogOpen(false);
      setEditingExpense(null);
      fetchData();
    } catch (error) {
      toast.error("Failed to update expense");
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Expense deleted successfully!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete expense");
    }
  };

  const getBikeName = (bikeId) => {
    const bike = bikes.find((b) => b.id === bikeId);
    return bike ? `${bike.name} (${bike.registration})` : "Unknown Bike";
  };

  // Filter expenses
  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = search
      ? expense.notes?.toLowerCase().includes(search.toLowerCase()) ||
        expense.type.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchesType = filterType !== "all" ? expense.type === filterType : true;
    const matchesBike = filterBike !== "all" ? expense.bike_id === filterBike : true;
    return matchesSearch && matchesType && matchesBike;
  });

  const typeColors = {
    Fuel: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    Service: "bg-red-500/20 text-red-400 border-red-500/30",
    Insurance: "bg-green-500/20 text-green-400 border-green-500/30",
    Other: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <div className="p-4 md:p-8 space-y-6" data-testid="expenses-page">
      {/* Header */}
      <div>
        <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
          Expenses
        </h1>
        <p className="text-zinc-400 mt-2">View and manage all expenses</p>
      </div>

      {/* Filters */}
      <Card className="glass border-white/10">
        <CardContent className="pt-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              data-testid="expense-search-input"
              placeholder="Search by notes or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Type
              </Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="filter-type-select" className="h-10 bg-zinc-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-zinc-800">All Types</SelectItem>
                  <SelectItem value="Fuel" className="text-white hover:bg-zinc-800">Fuel</SelectItem>
                  <SelectItem value="Service" className="text-white hover:bg-zinc-800">Service</SelectItem>
                  <SelectItem value="Insurance" className="text-white hover:bg-zinc-800">Insurance</SelectItem>
                  <SelectItem value="Other" className="text-white hover:bg-zinc-800">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Bike
              </Label>
              <Select value={filterBike} onValueChange={setFilterBike}>
                <SelectTrigger data-testid="filter-bike-select" className="h-10 bg-zinc-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-zinc-800">All Bikes</SelectItem>
                  {bikes.map((bike) => (
                    <SelectItem key={bike.id} value={bike.id} className="text-white hover:bg-zinc-800">
                      {bike.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses List */}
      {loading ? (
        <div className="text-center text-zinc-400 py-12">Loading expenses...</div>
      ) : filteredExpenses.length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="py-12">
            <div className="text-center text-zinc-400">
              {expenses.length === 0
                ? "No expenses recorded yet. Add your first expense!"
                : "No expenses match your filters."}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3" data-testid="expenses-list">
          {filteredExpenses.map((expense) => (
            <Card
              key={expense.id}
              className="glass border-white/10 hover:border-white/20 transition-all duration-200"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          typeColors[expense.type] || typeColors.Other
                        }`}
                      >
                        {expense.type}
                      </span>
                      <span className="text-sm text-zinc-500">
                        {getBikeName(expense.bike_id)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="font-mono font-bold text-2xl text-[#ccfbf1]">
                        ₹{expense.amount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-sm text-zinc-500 font-mono">
                        {format(new Date(expense.date), 'dd MMM yyyy')}
                      </div>
                      {expense.odometer && (
                        <div className="text-sm text-zinc-500 font-mono">
                          {expense.odometer.toLocaleString()} km
                        </div>
                      )}
                    </div>
                    {expense.notes && (
                      <div className="text-sm text-zinc-400">{expense.notes}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      data-testid={`edit-expense-${expense.id}`}
                      onClick={() => handleEdit(expense)}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      data-testid={`delete-expense-${expense.id}`}
                      onClick={() => handleDelete(expense.id)}
                      variant="outline"
                      size="sm"
                      className="rounded-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="glass border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading text-white">
              Edit Expense
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Update expense details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Bike *</Label>
              <Select
                value={formData.bike_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, bike_id: value })
                }
              >
                <SelectTrigger className="h-12 bg-zinc-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  {bikes.map((bike) => (
                    <SelectItem key={bike.id} value={bike.id} className="text-white hover:bg-zinc-800">
                      {bike.name} - {bike.registration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger className="h-12 bg-zinc-900/50 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10">
                  <SelectItem value="Fuel" className="text-white hover:bg-zinc-800">Fuel</SelectItem>
                  <SelectItem value="Service" className="text-white hover:bg-zinc-800">Service</SelectItem>
                  <SelectItem value="Insurance" className="text-white hover:bg-zinc-800">Insurance</SelectItem>
                  <SelectItem value="Other" className="text-white hover:bg-zinc-800">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Amount (₹) *</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="h-12 bg-zinc-900/50 border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Date *</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="h-12 bg-zinc-900/50 border-white/10 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Odometer (km)</Label>
              <Input
                type="number"
                value={formData.odometer}
                onChange={(e) =>
                  setFormData({ ...formData, odometer: e.target.value })
                }
                className="h-12 bg-zinc-900/50 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="min-h-[100px] bg-zinc-900/50 border-white/10 text-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-full bg-[#ccfbf1] hover:bg-[#99f6e4] text-[#115e59] font-semibold transition-colors duration-200"
            >
              Update Expense
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses;