import { useState } from "react";
import { QrCode, Smartphone, ScanLine, QrCodeIcon } from "lucide-react";
import NumberInput from "@/components/NumberInput";
import MomoPayInput from "@/components/MomoPayInput";
import QRScanner from "@/components/QRScanner";
import QRCodeGenerator from "@/components/QRCodeGenerator";

type PaymentMethod = "none" | "qr" | "number" | "momopay" | "generate";

const Index = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("none");

  const renderContent = () => {
    switch (selectedMethod) {
      case "qr":
        return <QRScanner onBack={() => setSelectedMethod("none")} />;
      case "number":
        return <NumberInput onBack={() => setSelectedMethod("none")} />;
      case "momopay":
        return <MomoPayInput onBack={() => setSelectedMethod("none")} />;
      case "generate":
        return <QRCodeGenerator onBack={() => setSelectedMethod("none")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-mtn-blue p-4">
      <h1 className="text-2xl font-bold text-white text-center mt-10 mb-8">
        Rwanda MOMO Pay
      </h1>

      {selectedMethod === "none" ? (
        <div className="space-y-4">
          <button
            onClick={() => setSelectedMethod("qr")}
            className="w-full h-20 bg-mtn-yellow rounded-lg flex items-center justify-center gap-3 hover:bg-mtn-yellow/90 transition-colors"
          >
            <ScanLine className="w-6 h-6 text-mtn-blue" />
            <span className="text-lg font-semibold text-mtn-blue">Scan QR Code</span>
          </button>

          <button
            onClick={() => setSelectedMethod("number")}
            className="w-full h-20 bg-white rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <Smartphone className="w-6 h-6 text-mtn-blue" />
            <span className="text-lg font-medium text-mtn-blue">Enter Number</span>
          </button>

          <button
            onClick={() => setSelectedMethod("momopay")}
            className="w-full h-20 bg-white rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <QrCode className="w-6 h-6 text-mtn-blue" />
            <span className="text-lg font-medium text-mtn-blue">MomoPay Code</span>
          </button>

          <button
            onClick={() => setSelectedMethod("generate")}
            className="w-full h-20 bg-white rounded-lg flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors"
          >
            <QrCodeIcon className="w-6 h-6 text-mtn-blue" />
            <span className="text-lg font-medium text-mtn-blue">Generate Payment QR</span>
          </button>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default Index;