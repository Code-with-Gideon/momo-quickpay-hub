import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface QRScannerProps {
  onBack: () => void;
}

const QRScanner = ({ onBack }: QRScannerProps) => {
  const qrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!qrRef.current) return;

    const html5QrCode = new Html5Qrcode("qr-reader");

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // Assuming QR code contains phone number
            const phoneNumber = decodedText;
            if (/^07\d{8}$/.test(phoneNumber)) {
              html5QrCode.stop();
              const ussdCode = `tel:*182*1*1*${phoneNumber}%23`;
              window.location.href = ussdCode;
            } else {
              toast.error("Invalid QR code format");
            }
          },
          undefined
        );
      } catch (err) {
        toast.error("Failed to access camera");
      }
    };

    startScanner();

    return () => {
      html5QrCode.stop().catch(console.error);
    };
  }, []);

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
      
      <div 
        id="qr-reader" 
        ref={qrRef}
        className="w-full max-w-[300px] mx-auto"
      />
    </div>
  );
};

export default QRScanner;