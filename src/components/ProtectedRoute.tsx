
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // Redirect to auth if not authenticated
      if (!user) {
        navigate("/auth");
      }
      // Redirect to dashboard if admin access is required but user is not an admin
      else if (requireAdmin && !isAdmin) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, isLoading, navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#070058]"></div>
      </div>
    );
  }

  // Only render children if:
  // 1. User is authenticated AND
  // 2. Either admin access is not required OR user is an admin
  return user && (!requireAdmin || isAdmin) ? <>{children}</> : null;
};

export default ProtectedRoute;
