
import { useState } from "react";
import { Send, Smartphone, QrCode, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/NumberInput";
import QRScanner from "@/components/QRScanner";
import MomoPayInput from "@/components/MomoPayInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import RecentTransactions from "@/components/RecentTransactions";
import SendMoneyView from "@/components/SendMoneyView";
import BuyAirtimeView from "@/components/BuyAirtimeView";
import BuyDataView from "@/components/BuyDataView";
import FeedbackForm from "@/components/FeedbackForm";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import UserMenu from "@/components/UserMenu";
import { useTransactions } from "@/hooks/useTransactions";
import { useNavigate } from "react-router-dom";

type Screen = "home" | "qr" | "number" | "momopay" | "generate" | "send" | "airtime" | "data";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<"send" | "receive" | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use our custom hook to get recent transactions (last 7 days)
  const { transactions, isLoading, addTransaction } = useTransactions({ recentDays: 7 });

  // Function to handle successful transaction completion
  const handleTransactionComplete = async (transaction: any) => {
    console.log("Transaction completed:", transaction);
    const savedTransaction = await addTransaction(transaction);
    
    // Navigate to receipt page and pass transaction data
    navigate(`/receipt/${savedTransaction.timestamp}`, { 
      state: { 
        transaction: savedTransaction,
        isNew: true 
      } 
    });
  };

  const handleQRScanSuccess = (decodedText: string) => {
    try {
      const parsedData = JSON.parse(decodedText);
      if (parsedData.code) {
        toast.success("QR Code scanned successfully");
        setCurrentScreen("home");
      } else {
        toast.error("Invalid QR code format");
      }
    } catch (error) {
      toast.error("Invalid QR code");
    }
  };

  const renderContent = () => {
    if (currentScreen === "send") {
      return <SendMoneyView onBack={() => setCurrentScreen("home")} onTransactionComplete={handleTransactionComplete} />;
    }
    if (currentScreen === "airtime") {
      return <BuyAirtimeView onBack={() => setCurrentScreen("home")} onTransactionComplete={handleTransactionComplete} />;
    }
    if (currentScreen === "data") {
      return <BuyDataView onBack={() => setCurrentScreen("home")} onTransactionComplete={handleTransactionComplete} />;
    }
    if (currentScreen === "home" && !mode) {
      return <div className="space-y-6 px-4 py-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold text-[#070058]">MoMo Quickpay</h1>
            <UserMenu />
          </div>

          <div className="rounded-[20px] overflow-hidden h-[180px] relative shadow-lg">
            <img src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" alt="Banner Background" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#070058]/70 flex flex-col justify-center items-center text-center px-6">
              <h1 className="text-[19px] font-bold text-white mb-3">Welcome to<br />Momo Quickpay (DEMO)</h1>
              <p className="text-[13px] text-white/90 max-w-[240px]">A simple interface to navigate through MOMO</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button onClick={() => setCurrentScreen("send")} className="h-[72px] bg-[#070058] hover:bg-[#070058]/90 text-white flex flex-col items-center justify-center gap-2 rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02] text-center">
              <Send className="w-6 h-6" />
              <span className="text-sm font-medium">Send Money</span>
            </Button>
            <Button onClick={() => setCurrentScreen("generate")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
              <QrCode className="w-6 h-6" />
              <span className="text-sm font-medium">Recieve Money</span>
            </Button>
            <Button onClick={() => setCurrentScreen("airtime")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
              <Smartphone className="w-6 h-6" />
              <span className="text-sm font-medium">Buy Airtime</span>
            </Button>
            <Button onClick={() => setCurrentScreen("data")} variant="outline" className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] text-center">
              <Signal className="w-6 h-6" />
              <span className="text-sm font-medium">Buy Data</span>
            </Button>
          </div>

          <RecentTransactions 
            transactions={transactions} 
            isLoading={isLoading}
            limit={5} 
          />
          <FeedbackForm />
        </div>;
    }
    switch (currentScreen) {
      case "qr":
        return <QRScanner onBack={() => setCurrentScreen("home")} onScanSuccess={handleQRScanSuccess} />;
      case "number":
        return <NumberInput onBack={() => setCurrentScreen("home")} onTransactionComplete={handleTransactionComplete} />;
      case "momopay":
        return <MomoPayInput onBack={() => setCurrentScreen("home")} onTransactionComplete={handleTransactionComplete} />;
      case "generate":
        return <QRCodeGenerator onBack={() => setCurrentScreen("home")} />;
      default:
        return null;
    }
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {renderContent()}
      </div>
    </div>;
};
export default Index;
