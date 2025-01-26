import { useState } from "react";
import { QrCode, Smartphone, ScanLine, QrCodeIcon } from "lucide-react";
import NumberInput from "@/components/NumberInput";
import MomoPayInput from "@/components/MomoPayInput";
import QRScanner from "@/components/QRScanner";
import QRCodeGenerator from "@/components/QRCodeGenerator";

const Index = () => {
  const [screen, setScreen] = useState<"home" | "number" | "momopay" | "scan" | "generate">("home");

  const renderScreen = () => {
    switch (screen) {
      case "number":
        return <NumberInput onBack={() => setScreen("home")} />;
      case "momopay":
        return <MomoPayInput onBack={() => setScreen("home")} />;
      case "scan":
        return <QRScanner />;
      case "generate":
        return <QRCodeGenerator />;
      default:
        return (
          <div className="flex flex-col gap-4">
            <button
              onClick={() => setScreen("scan")}
              className="h-20 rounded-lg flex items-center justify-center gap-3 bg-mtn-yellow"
            >
              <ScanLine size={24} className="text-mtn-blue" />
              <span className="text-lg font-semibold text-mtn-blue">Scan QR Code</span>
            </button>
            
            <button
              onClick={() => setScreen("number")}
              className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
            >
              <Smartphone size={24} className="text-mtn-blue" />
              <span className="text-lg font-medium text-mtn-blue">Enter Number</span>
            </button>

            <button
              onClick={() => setScreen("momopay")}
              className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
            >
              <QrCode size={24} className="text-mtn-blue" />
              <span className="text-lg font-medium text-mtn-blue">MomoPay Code</span>
            </button>

            <button
              onClick={() => setScreen("generate")}
              className="h-20 rounded-lg flex items-center justify-center gap-3 bg-white"
            >
              <QrCodeIcon size={24} className="text-mtn-blue" />
              <span className="text-lg font-medium text-mtn-blue">Generate Payment QR</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-mtn-blue p-4">
      <h1 className="text-2xl font-bold text-white text-center mt-10 mb-8">
        Rwanda MOMO Pay
      </h1>
      {renderScreen()}
    </div>
  );
};

export default Index;