import { useState } from "react";
import { ScanIcon, Smartphone, QrCode, QrCodeIcon, ArrowUpFromLine, ArrowDownToLine, PhoneCall, Send, Signal } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/NumberInput";
import QRScanner from "@/components/QRScanner";
import MomoPayInput from "@/components/MomoPayInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";
import RecentTransactions from "@/components/RecentTransactions";

type Screen = "home" | "qr" | "number" | "momopay" | "generate";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<"send" | "receive" | null>(null);

  const handleCheckAccountNumber = () => {
    window.location.href = "tel:*135*8%23";
  };

  const renderContent = () => {
    if (currentScreen === "home" && !mode) {
      return (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-[#070058] rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src="/lovable-uploads/734bfea9-bb0b-4eea-96b1-43607ba8d7de.png" 
                alt="Banner Background"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => setMode("send")}
              className="h-24 bg-[#221F26] hover:bg-[#221F26]/90 text-white flex flex-col items-center justify-center gap-2 rounded-xl"
            >
              <Send className="w-6 h-6" />
              <span>Send Money</span>
            </Button>
            <Button
              onClick={() => setCurrentScreen("generate")}
              variant="outline"
              className="h-24 border-2 hover:bg-gray-50 text-[#221F26] flex flex-col items-center justify-center gap-2 rounded-xl"
            >
              <QrCode className="w-6 h-6" />
              <span>Generate QR Code</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-2 hover:bg-gray-50 text-[#221F26] flex flex-col items-center justify-center gap-2 rounded-xl"
            >
              <Smartphone className="w-6 h-6" />
              <span>Buy Airtime</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 border-2 hover:bg-gray-50 text-[#221F26] flex flex-col items-center justify-center gap-2 rounded-xl"
            >
              <Signal className="w-6 h-6" />
              <span>Buy Data</span>
            </Button>
          </div>

          {/* Recent Transactions */}
          <RecentTransactions />

          {/* Feedback Link */}
          <div className="text-center mt-8">
            <a href="#" className="text-[#221F26] text-sm hover:underline">
              Have a Feedback?
            </a>
          </div>
        </div>
      );
    }

    if (mode === "send" && currentScreen === "home") {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setMode(null)}
            className="mb-6 text-white hover:text-white/80 font-semibold"
          >
            ← Back
          </Button>

          <Button
            onClick={() => setCurrentScreen("qr")}
            className="w-full h-20 text-lg font-semibold bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <ScanIcon className="w-7 h-7" />
            Scan Payment QR Code
          </Button>
          
          <Button
            onClick={() => setCurrentScreen("number")}
            className="w-full h-20 text-lg font-semibold bg-white hover:bg-gray-50 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-mtn-yellow"
          >
            <Smartphone className="w-7 h-7" />
            Enter Account Number
          </Button>

          <Button
            onClick={() => setCurrentScreen("momopay")}
            className="w-full h-20 text-lg font-semibold bg-white hover:bg-gray-50 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-mtn-yellow"
          >
            <QrCode className="w-7 h-7" />
            Enter MomoPay Code
          </Button>
        </div>
      );
    }

    if (mode === "receive" && currentScreen === "home") {
      return (
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => setMode(null)}
            className="mb-6 text-white hover:text-white/80 font-semibold"
          >
            ← Back
          </Button>

          <Button
            onClick={() => setCurrentScreen("generate")}
            className="w-full h-20 text-lg font-semibold bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <QrCodeIcon className="w-7 h-7" />
            Generate Payment QR
          </Button>

          <Button
            onClick={handleCheckAccountNumber}
            className="w-full h-20 text-lg font-semibold bg-white hover:bg-gray-50 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-mtn-yellow"
          >
            <PhoneCall className="w-7 h-7" />
            Check Account Number
          </Button>
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
      <div className="max-w-lg mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
