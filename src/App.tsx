import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import Receipt from "@/pages/Receipt";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import AdminDashboard from "@/pages/AdminDashboard";

// Update the routes to include the new AdminDashboard
function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/receipt/:id?" element={<ProtectedRoute><Receipt /></ProtectedRoute>} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </Router>
      <Toaster richColors />
    </>
  );
}

export default App;
