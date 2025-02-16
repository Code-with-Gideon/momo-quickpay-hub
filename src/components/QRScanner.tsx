
import { useState, useEffect } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface QRScannerProps {
  onBack: () => void;
  onScanSuccess: (decodedText: string) => void;
}

const QRScanner = ({ onBack, onScanSuccess }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false
      );

      scanner.render(
        (decodedText) => {
          onScanSuccess(decodedText);
          if (scanner) {
            scanner.clear();
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isScanning, onScanSuccess]);

  return (
    <div className="p-6 space-y-4">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-4 text-[#070058] hover:text-[#070058]/80"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      <h2 className="text-[#070058] text-lg font-semibold">Scan QR Code</h2>
      
      <div className="qr-scanner-container">
        {/* Required elements for html5-qrcode library */}
        <div id="reader" className="w-full"></div>
        <div id="reader__status_span" className="hidden"></div>
        <div id="reader__scan_region" className="hidden"></div>
        <div id="reader__dashboard_section" className="hidden"></div>
        <div id="reader__header_message" className="hidden"></div>
      </div>

      <style jsx>{`
        .qr-scanner-container {
          position: relative;
          min-height: 400px;
        }
        #reader {
          width: 100% !important;
          border: none !important;
        }
        #reader__scan_region {
          background: white !important;
          border-radius: 12px !important;
        }
        #reader__scan_region > img {
          display: none;
        }
        #reader video {
          border-radius: 12px !important;
        }
      `}</style>
    </div>
  );
};

export default QRScanner;
