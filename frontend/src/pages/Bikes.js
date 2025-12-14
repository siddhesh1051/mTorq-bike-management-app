import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bike, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Bikes = () => {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBike, setEditingBike] = useState(null);
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    registration: "",
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
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (editingBike) {
        // Update bike
        await axios.put(`${API}/bikes/${editingBike.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Bike updated successfully!");
      } else {
        // Create bike
        await axios.post(`${API}/bikes`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Bike added successfully!");
      }

      setDialogOpen(false);
      setFormData({ brand: "", model: "", registration: "" });
      setEditingBike(null);
      fetchBikes();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save bike");
    }
  };

  const handleEdit = (bike) => {
    setEditingBike(bike);
    setFormData({
      brand: bike.brand || "",
      model: bike.model,
      registration: bike.registration || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (bikeId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this bike? All associated expenses will also be deleted."
      )
    ) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/bikes/${bikeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Bike deleted successfully!");
      fetchBikes();
    } catch (error) {
      toast.error("Failed to delete bike");
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingBike(null);
    setFormData({ brand: "", model: "", registration: "" });
  };

  return (
    <div className="p-4 md:p-8 space-y-6" data-testid="bikes-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight text-white">
            My Bikes
          </h1>
          <p className="text-zinc-400 mt-2">Manage your bikes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              data-testid="add-bike-button"
              onClick={() => handleDialogClose()}
              className="rounded-full bg-[#ccfbf1] hover:bg-[#99f6e4] text-[#115e59] font-semibold transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" strokeWidth={2} />
              Add Bike
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-white">
                {editingBike ? "Edit Bike" : "Add New Bike"}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {editingBike
                  ? "Update your bike details"
                  : "Add a new bike to track expenses"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Brand *</Label>
                <Input
                  data-testid="bike-brand-input"
                  placeholder="e.g., Royal Enfield"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">Model *</Label>
                <Input
                  data-testid="bike-model-input"
                  placeholder="e.g., Classic 350"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-300">
                  Registration Number (Optional)
                </Label>
                <Input
                  data-testid="bike-registration-input"
                  placeholder="e.g., DL-01-AB-1234"
                  value={formData.registration}
                  onChange={(e) =>
                    setFormData({ ...formData, registration: e.target.value })
                  }
                  className="h-12 bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                type="submit"
                data-testid="bike-submit-button"
                className="w-full h-12 rounded-full bg-[#ccfbf1] hover:bg-[#99f6e4] text-[#115e59] font-semibold transition-colors duration-200"
              >
                {editingBike ? "Update Bike" : "Add Bike"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bikes Grid */}
      {loading ? (
        <div className="text-center text-zinc-400 py-12">Loading bikes...</div>
      ) : bikes.length === 0 ? (
        <Card className="glass border-white/10">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                <Bike className="w-10 h-10 text-zinc-600" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-xl font-heading font-semibold text-white mb-2">
                  No bikes yet
                </h3>
                <p className="text-zinc-400">
                  Add your first bike to start tracking expenses
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          data-testid="bikes-list"
        >
          {bikes.map((bike) => (
            <Card
              key={bike.id}
              className="glass border-white/10 group hover:border-white/20 transition-all duration-300"
            >
              <CardHeader>
                <div className="aspect-video relative overflow-hidden rounded bg-zinc-800 mb-4">
                  <img
                    src="https://images.unsplash.com/photo-1589963575227-08d8ea840e85?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDJ8MHwxfHNlYXJjaHwyfHxtb3RvcmN5Y2xlJTIwb24lMjB3aW5kaW5nJTIwcm9hZCUyMGRhcmslMjBtb29keXxlbnwwfHx8fDE3NjU1NjYyNTl8MA&ixlib=rb-4.1.0&q=85"
                    alt={`${bike.brand || ""} ${bike.model}`}
                    className="w-full h-full object-cover filter grayscale contrast-125"
                  />
                </div>
                <CardTitle className="text-xl font-heading text-white">
                  {bike.brand || ""} {bike.model}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {bike.registration && (
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                      Registration Number
                    </div>
                    <div className="text-zinc-300 font-mono text-lg">
                      {bike.registration}
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    data-testid={`edit-bike-${bike.id}`}
                    onClick={() => handleEdit(bike)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    data-testid={`delete-bike-${bike.id}`}
                    onClick={() => handleDelete(bike.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bikes;
