
import { useAuth } from "@/contexts/AuthContext";
import TransactionDashboard from "@/components/TransactionDashboard";
import UserMenu from "@/components/UserMenu";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#070058]">
            Momo Quickpay Dashboard
          </h1>
          <UserMenu />
        </header>
        
        <TransactionDashboard userId={user?.id} isAdmin={isAdmin} />
      </div>
    </div>
  );
};

export default Dashboard;
