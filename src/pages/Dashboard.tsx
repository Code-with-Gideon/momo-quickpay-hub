
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import { useTransactions } from "@/hooks/useTransactions";
import RecentTransactions from "@/components/RecentTransactions";
import { Button } from "@/components/ui/button";
import { Send, Smartphone, Signal, ArrowLeft } from "lucide-react";
import { useState } from "react";
import SendMoneyView from "@/components/SendMoneyView";
import BuyAirtimeView from "@/components/BuyAirtimeView";
import BuyDataView from "@/components/BuyDataView";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { transactions, isLoading, addTransaction } = useTransactions({ 
    userId: user?.id 
  });

  // Function to handle successful transaction completion
  const handleTransactionComplete = async (transaction: any) => {
    console.log("Transaction completed:", transaction);
    const savedTransaction = await addTransaction(transaction);
    
    // Navigate to receipt page and pass transaction data
    // Since the Transaction type doesn't have an 'id' property directly,
    // we use a reference or timestamp to identify the transaction
    navigate(`/receipt/${savedTransaction.timestamp}`, { 
      state: { 
        transaction: savedTransaction,
        isNew: true 
      } 
    });
  };

  const renderContent = () => {
    if (activeView === "send") {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <SendMoneyView 
            onBack={() => setActiveView(null)} 
            onTransactionComplete={handleTransactionComplete} 
          />
        </div>
      );
    }
    
    if (activeView === "airtime") {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <BuyAirtimeView 
            onBack={() => setActiveView(null)} 
            onTransactionComplete={handleTransactionComplete} 
          />
        </div>
      );
    }
    
    if (activeView === "data") {
      return (
        <div>
          <Button 
            variant="ghost" 
            onClick={() => setActiveView(null)}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <BuyDataView 
            onBack={() => setActiveView(null)} 
            onTransactionComplete={handleTransactionComplete} 
          />
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="rounded-[20px] overflow-hidden h-[180px] relative shadow-lg">
          <img src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" alt="Banner Background" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-[#070058]/70 flex flex-col justify-center items-center text-center px-6">
            <h1 className="text-[19px] font-bold text-white mb-3">Welcome to<br />Your Transaction Dashboard</h1>
            <p className="text-[13px] text-white/90 max-w-[240px]">View your transaction history and make new transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => setActiveView("send")} className="h-[72px] bg-[#070058] hover:bg-[#070058]/90 text-white flex flex-col items-center justify-center gap-2 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] text-center">
            <Send className="w-6 h-6" />
            <span className="text-sm font-medium">Send Money</span>
          </Button>
          <Button onClick={() => navigate("/dashboard/generate")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
            <Signal className="w-6 h-6" />
            <span className="text-sm font-medium">Receive Money</span>
          </Button>
          <Button onClick={() => setActiveView("airtime")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
            <Smartphone className="w-6 h-6" />
            <span className="text-sm font-medium">Buy Airtime</span>
          </Button>
          <Button onClick={() => setActiveView("data")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
            <Signal className="w-6 h-6" />
            <span className="text-sm font-medium">Buy Data</span>
          </Button>
        </div>

        <RecentTransactions 
          transactions={transactions} 
          isLoading={isLoading}
          limit={5}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-[#070058]">MoMo Quickpay</h1>
          <UserMenu />
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
