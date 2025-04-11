
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Receipt from "@/pages/Receipt";
import FeedbackForm from "@/components/FeedbackForm";
import {
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
  const { user, isAdmin, isLoading } = useAuth();
  
  console.log("Protected route:", { isLoading, user: !!user, isAdmin });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#070058]"></div>
    </div>;
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
