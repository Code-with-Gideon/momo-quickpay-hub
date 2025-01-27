import { useState } from "react";
import { ScanIcon, Smartphone, QrCode, QrCodeIcon, ArrowUpFromLine, ArrowDownToLine, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/NumberInput";
import QRScanner from "@/components/QRScanner";
import MomoPayInput from "@/components/MomoPayInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";

type Screen = "home" | "qr" | "number" | "momopay" | "generate";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [mode, setMode] = useState<"send" | "receive" | null>(null);

  const handleCheckAccountNumber = () => {
    window.location.href = "tel:*135*8%23";
  };

  const renderContent = () => {
    if (mode === null) {
      return (
        <div className="space-y-6">
          <Button
            onClick={() => setMode("send")}
            className="w-full h-24 text-xl font-semibold bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <ArrowUpFromLine className="w-8 h-8" />
            Send Money
          </Button>
          
          <Button
            onClick={() => setMode("receive")}
            className="w-full h-24 text-xl font-semibold bg-white hover:bg-gray-50 text-mtn-blue flex items-center justify-center gap-4 rounded-xl shadow-lg transition-all duration-300 hover:scale-[1.02] border-2 border-mtn-yellow"
          >
            <ArrowDownToLine className="w-8 h-8" />
            Receive Money
          </Button>
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
    <div className="min-h-screen bg-gradient-to-b from-mtn-blue to-mtn-blue/90 p-6">
      <div className="max-w-md mx-auto pt-8">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Momo QuickPay
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;