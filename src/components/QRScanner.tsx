import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QRScannerProps {
  onBack: () => void;
}

const QRScanner = ({ onBack }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [amount, setAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showScanner && !isScanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scannerRef.current.render(onScanSuccess, onScanFailure);
      setIsScanning(true);
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showScanner]);

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      if (!amount) {
        toast.error("Please enter an amount first");
        return;
      }

      const ussdCode = data.type === "account"
        ? `tel:*182*1*1*${data.code}*${amount}%23`
        : `tel:*182*8*1*${data.code}*${amount}%23`;

      window.location.href = ussdCode;
    } catch (error) {
      toast.error("Invalid QR code");
    }
  };

  const onScanFailure = (error: string) => {
    console.error("QR scan error:", error);
  };

  const handleStartScanning = () => {
    if (!amount) {
      toast.error("Please enter an amount first");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    setShowScanner(true);
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-mtn-blue hover:text-mtn-blue/80"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {!showScanner ? (
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (RWF)
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            onClick={handleStartScanning}
            className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
          >
            Start Scanning
          </Button>
        </div>
      ) : (
        <div id="reader" className="w-full"></div>
      )}
    </div>
  );
};

export default QRScanner;