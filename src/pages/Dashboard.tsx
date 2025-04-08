
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/UserMenu";
import { useTransactions } from "@/hooks/useTransactions";
import RecentTransactions from "@/components/RecentTransactions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    navigate(`/receipt/${savedTransaction.id}`, { 
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

        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Quick Services</TabsTrigger>
            <TabsTrigger value="history">Transaction History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card
                className="cursor-pointer hover:border-[#070058] transition-colors"
                onClick={() => setActiveView("send")}
              >
                <CardHeader className="flex flex-row items-center justify-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                    <Send className="w-6 h-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <h3 className="font-semibold text-[#070058]">Send Money</h3>
                  <p className="text-sm text-gray-500 mt-1">Transfer to another account</p>
                </CardContent>
              </Card>
              
              <Card
                className="cursor-pointer hover:border-[#070058] transition-colors"
                onClick={() => setActiveView("airtime")}
              >
                <CardHeader className="flex flex-row items-center justify-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <h3 className="font-semibold text-[#070058]">Buy Airtime</h3>
                  <p className="text-sm text-gray-500 mt-1">Purchase airtime for any number</p>
                </CardContent>
              </Card>
              
              <Card
                className="cursor-pointer hover:border-[#070058] transition-colors"
                onClick={() => setActiveView("data")}
              >
                <CardHeader className="flex flex-row items-center justify-center py-4">
                  <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                    <Signal className="w-6 h-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <h3 className="font-semibold text-[#070058]">Buy Data</h3>
                  <p className="text-sm text-gray-500 mt-1">Purchase data bundles</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="history">
            <div className="mt-6">
              <RecentTransactions 
                transactions={transactions} 
                isLoading={isLoading}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-6">
      <div className="max-w-6xl mx-auto px-4">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#070058]">
            Momo Quickpay Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={() => navigate("/")}
              className="border-[#070058] text-[#070058]"
            >
              Home
            </Button>
            <UserMenu />
          </div>
        </header>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
