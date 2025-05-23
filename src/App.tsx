
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Receipt from "./pages/Receipt";
import AdminDashboard from "./pages/AdminDashboard";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  // Handle hash fragments from password reset links
  const handleHashRedirect = () => {
    // Check if the URL contains a hash with access_token and type=recovery
    const hash = window.location.hash;
    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
      // Convert the hash to a search parameter format
      const hashParams = new URLSearchParams(hash.substring(1));
      if (hashParams.get('type') === 'recovery') {
        // Redirect to the auth page with reset=true parameter
        window.location.href = '/auth?reset=true';
        return null;
      }
    }
    return undefined;
  };

  // Check for hash redirects
  const hashRedirect = handleHashRedirect();
  if (hashRedirect === null) {
    return null; // Return null during redirect to prevent rendering
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/receipt/:id" element={<Receipt />} />
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                {/* Catch-all route for password reset links */}
                <Route path="/auth/callback/*" element={<Navigate to="/auth?reset=true" replace />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
