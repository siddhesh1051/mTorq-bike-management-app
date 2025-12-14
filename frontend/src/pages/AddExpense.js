import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AddExpense = () => {
  const navigate = useNavigate();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    bike_id: "",
    type: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    odometer: "",
    notes: "",
  });

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API}/bikes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBikes(response.data);
    } catch (error) {
      toast.error("Failed to load bikes");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bike_id || !formData.type || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        odometer: formData.odometer ? parseInt(formData.odometer) : null,
      };

      await axios.post(`${API}/expenses`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Expense added successfully!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8" data-testid="add-expense-page">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
            Add Expense
          </h1>
          <p className="text-zinc-400 mt-2">Record a new bike expense</p>
        </div>

        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="text-xl font-heading text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#ccfbf1]" strokeWidth={1.5} />
              Expense Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Bike Selection */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Bike *</Label>
                <Select
                  value={formData.bike_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, bike_id: value })
                  }
                >
                  <SelectTrigger
                    data-testid="expense-bike-select"
                    className="h-12 bg-zinc-900/50 border-white/10 text-white"
                  >
                    <SelectValue placeholder="Select a bike" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 z-[100]">
                    {bikes.map((bike) => (
                      <SelectItem
                        key={bike.id}
                        value={bike.id}
                        className="text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
                      >
                        {bike.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Selection */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger
                    data-testid="expense-type-select"
                    className="h-12 bg-zinc-900/50 border-white/10 text-white"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 z-[100]">
                    <SelectItem
                      value="Fuel"
                      className="text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      Fuel
                    </SelectItem>
                    <SelectItem
                      value="Service"
                      className="text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      Service
                    </SelectItem>
                    <SelectItem
                      value="Insurance"
                      className="text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      Insurance
                    </SelectItem>
                    <SelectItem
                      value="Other"
                      className="text-white focus:bg-zinc-800 focus:text-white cursor-pointer"
                    >
                      Other
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Amount (₹) *</Label>
                <Input
                  data-testid="expense-amount-input"
                  type="number"
                  step="0.01"
                  placeholder="Enter amount"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                  required
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Date *</Label>
                <Input
                  data-testid="expense-date-input"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white"
                  required
                />
              </div>

              {/* Odometer */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Odometer (km)</Label>
                <Input
                  data-testid="expense-odometer-input"
                  type="number"
                  placeholder="Enter odometer reading"
                  value={formData.odometer}
                  onChange={(e) =>
                    setFormData({ ...formData, odometer: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label className="text-zinc-300">Notes</Label>
                <Textarea
                  data-testid="expense-notes-input"
                  placeholder="Add any notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="min-h-[100px] bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />
              </div>

              <Button
                type="submit"
                data-testid="expense-submit-button"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#ccfbf1] hover:bg-[#99f6e4] text-[#115e59] font-semibold transition-colors duration-200"
              >
                {loading ? "Adding..." : "Add Expense"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AddExpense;
