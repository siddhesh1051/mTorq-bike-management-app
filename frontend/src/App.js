import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AddExpense from "./pages/AddExpense";
import Bikes from "./pages/Bikes";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import { Toaster } from "./components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#09090b]">
        <div className="text-[#ccfbf1] text-xl font-heading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="App h-full">
      <BrowserRouter>
        <Routes>
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/" /> : <AuthPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/"
            element={
              user ? (
                <Layout onLogout={handleLogout}>
                  <Dashboard />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/add-expense"
            element={
              user ? (
                <Layout onLogout={handleLogout}>
                  <AddExpense />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/bikes"
            element={
              user ? (
                <Layout onLogout={handleLogout}>
                  <Bikes />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/expenses"
            element={
              user ? (
                <Layout onLogout={handleLogout}>
                  <Expenses />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
          <Route
            path="/settings"
            element={
              user ? (
                <Layout onLogout={handleLogout}>
                  <Settings onLogout={handleLogout} />
                </Layout>
              ) : (
                <Navigate to="/auth" />
              )
            }
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" />
    </div>
  );
}

export default App;