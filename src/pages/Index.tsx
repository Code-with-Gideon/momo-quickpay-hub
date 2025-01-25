import { useState } from "react";
import { ScanIcon, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import NumberInput from "@/components/NumberInput";

const Index = () => {
  const [showNumberInput, setShowNumberInput] = useState(false);
  const defaultNumber = "0780000000"; // Replace with actual default number

  const handleQRScan = () => {
    // In a real app, this would open the camera for QR scanning
    toast.info("QR scanning would open camera in production");
    dialUSSD(defaultNumber);
  };

  const dialUSSD = (phoneNumber: string) => {
    const ussdCode = `tel:*182*1*1*${phoneNumber}%23`;
    window.location.href = ussdCode;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-mtn-blue to-mtn-blue/90 p-4">
      <div className="max-w-md mx-auto pt-10">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Rwanda MOMO Pay
        </h1>
        
        {!showNumberInput ? (
          <div className="space-y-6">
            <Button
              onClick={handleQRScan}
              className="w-full h-20 text-lg bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue flex items-center justify-center gap-3"
            >
              <ScanIcon className="w-6 h-6" />
              Scan QR Code
            </Button>
            
            <Button
              onClick={() => setShowNumberInput(true)}
              className="w-full h-20 text-lg bg-white hover:bg-gray-100 text-mtn-blue flex items-center justify-center gap-3"
            >
              <Smartphone className="w-6 h-6" />
              Enter Number
            </Button>
          </div>
        ) : (
          <NumberInput 
            onBack={() => setShowNumberInput(false)}
            onSubmit={dialUSSD}
          />
        )}
      </div>
    </div>
  );
};

export default Index;