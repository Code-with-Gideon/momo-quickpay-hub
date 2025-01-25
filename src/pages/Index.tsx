import { useState } from "react";
import { ScanIcon, Smartphone, QrCode, QrCodeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberInput from "@/components/NumberInput";
import QRScanner from "@/components/QRScanner";
import MomoPayInput from "@/components/MomoPayInput";
import QRCodeGenerator from "@/components/QRCodeGenerator";

type PaymentMethod = "none" | "qr" | "number" | "momopay" | "generate";

const Index = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("none");

  const renderContent = () => {
    switch (paymentMethod) {
      case "qr":
        return <QRScanner onBack={() => setPaymentMethod("none")} />;
      case "number":
        return <NumberInput onBack={() => setPaymentMethod("none")} />;
      case "momopay":
        return <MomoPayInput onBack={() => setPaymentMethod("none")} />;
      case "generate":
        return <QRCodeGenerator onBack={() => setPaymentMethod("none")} />;
      default:
        return (
          <div className="space-y-4">
            <Button
              onClick={() => setPaymentMethod("qr")}
              className="w-full h-20 text-lg bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue flex items-center justify-center gap-3"
            >
              <ScanIcon className="w-6 h-6" />
              Scan QR Code
            </Button>
            
            <Button
              onClick={() => setPaymentMethod("number")}
              className="w-full h-20 text-lg bg-white hover:bg-gray-100 text-mtn-blue flex items-center justify-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              Enter Number
            </Button>

            <Button
              onClick={() => setPaymentMethod("momopay")}
              className="w-full h-20 text-lg bg-white hover:bg-gray-100 text-mtn-blue flex items-center justify-center gap-3"
            >
              <QrCode className="w-6 h-6" />
              MomoPay Code
            </Button>

            <Button
              onClick={() => setPaymentMethod("generate")}
              className="w-full h-20 text-lg bg-white hover:bg-gray-100 text-mtn-blue flex items-center justify-center gap-3"
            >
              <QrCodeIcon className="w-6 h-6" />
              Generate Payment QR
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mtn-blue to-mtn-blue/90 p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Rwanda MOMO Pay
        </h1>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;