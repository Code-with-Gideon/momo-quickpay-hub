
import { useState } from "react";
import { Send, Smartphone, QrCode, Signal, Scan, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/NumberInput";
import QRScanner from "@/components/QRScanner";
import MomoPayInput from "@/components/MomoPayInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import RecentTransactions from "@/components/RecentTransactions";
import SendMoneyView from "@/components/SendMoneyView";

type Screen = "home" | "qr" | "number" | "momopay" | "generate" | "send";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<"send" | "receive" | null>(null);

  const handleCheckAccountNumber = () => {
    window.location.href = "tel:*135*8%23";
  };

  const renderContent = () => {
    if (currentScreen === "send") {
      return <SendMoneyView onBack={() => setCurrentScreen("home")} />;
    }

    if (currentScreen === "home" && !mode) {
      return (
        <div className="space-y-6">
          {/* Banner */}
          <div className="rounded-[20px] overflow-hidden h-[180px] relative">
            <img 
              src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" 
              alt="Banner Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-[#070058]/70 flex flex-col justify-center items-center text-center">
              <h1 className="text-[19px] font-bold text-white mb-2">Welcome to<br />Momo Quickpay (DEMO)</h1>
              <p className="text-[13px] text-white/80">A simple interface to navigate through MOMO</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setCurrentScreen("send")}
              className="h-[72px] bg-[#070058] hover:bg-[#070058]/90 text-white flex items-center justify-center gap-3 rounded-xl"
            >
              <Send className="w-5 h-5" />
              <span>Send Money</span>
            </Button>
            <Button
              onClick={() => setCurrentScreen("generate")}
              variant="outline"
              className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex items-center justify-center gap-3 rounded-xl"
            >
              <QrCode className="w-5 h-5" />
              <span>Generate QR Code</span>
            </Button>
            <Button
              variant="outline"
              className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex items-center justify-center gap-3 rounded-xl"
            >
              <Smartphone className="w-5 h-5" />
              <span>Buy Airtime</span>
            </Button>
            <Button
              variant="outline"
              className="h-[72px] border-2 hover:bg-gray-50 text-[#070058] flex items-center justify-center gap-3 rounded-xl"
            >
              <Signal className="w-5 h-5" />
              <span>Buy Data</span>
            </Button>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions />

          {/* Feedback Link */}
          <div className="text-center mt-8">
            <a href="#" className="text-[#070058] text-sm hover:underline">
              Have a Feedback?
            </a>
          </div>
        </div>
      );
    }

    switch (currentScreen) {
      case "qr":
        return <QRScanner onBack={() => setCurrentScreen("home")} />;
      case "number":
        return <NumberInput onBack={() => setCurrentScreen("home")} />;
      case "momopay":
        return <MomoPayInput onBack={() => setCurrentScreen("home")} />;
      case "generate":
        return <QRCodeGenerator onBack={() => setCurrentScreen("home")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
