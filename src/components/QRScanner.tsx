import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QRScannerProps {
  onBack: () => void;
}

const QRScanner = ({ onBack }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isScanning) {
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
  }, []);

  const onScanSuccess = (decodedText: string) => {
    try {
      const data = JSON.parse(decodedText);
      
      if (data.type === "account") {
        window.location.href = `tel:*182*1*1*${data.code}%23`;
      } else if (data.type === "momopay") {
        window.location.href = `tel:*182*8*1*${data.code}%23`;
      } else {
        toast.error("Invalid QR code format");
      }
    } catch (error) {
      toast.error("Invalid QR code");
    }
  };

  const onScanFailure = (error: string) => {
    console.error("QR scan error:", error);
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

      <div id="reader" className="w-full"></div>
    </div>
  );
};

export default QRScanner;