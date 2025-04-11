import { Auth } from "@/pages/Auth";
import { Dashboard } from "@/pages/Dashboard";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { Receipt } from "@/pages/Receipt";
import { FeedbackForm } from "@/pages/FeedbackForm";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" />;
  }

  if (adminOnly && !isAdmin) {
    return <div>Access Denied</div>;
  }

  return <>{children}</>;
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute adminOnly>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/receipt/:id" element={<Receipt />} />
        <Route path="/feedback" element={<FeedbackForm />} />
      </Routes>
      <Toaster />
    </div>
  );
}

export default App;
