import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface QRCodeGeneratorProps {
  onBack: () => void;
}

const QRCodeGenerator = ({ onBack }: QRCodeGeneratorProps) => {
  const [paymentType, setPaymentType] = useState<"account" | "momopay">("account");
  const [code, setCode] = useState("");
  const [showQR, setShowQR] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleGenerate = () => {
    if (!code) {
      toast.error("Please enter a your Account number or Momopay code");
      return;
    }

    if (paymentType === "account" && !/^07\d{8}$/.test(code)) {
      toast.error("Please enter a valid Rwanda phone number");
      return;
    }

    if (paymentType === "momopay" && !/^\d+$/.test(code)) {
      toast.error("Please enter a valid MomoPay code");
      return;
    }

    setShowQR(true);
  };

  const handleDownload = () => {
    if (!qrRef.current) return;

    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Create a larger canvas for the decorated QR code
    canvas.width = 400;
    canvas.height = 500;
    
    if (ctx) {
      // Fill white background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw decorative elements
      ctx.strokeStyle = "#f0f0f0";
      ctx.lineWidth = 2;
      
      // Draw dollar signs in corners
      ctx.font = "24px Arial";
      ctx.fillStyle = "#e0e0e0";
      ctx.fillText("$", 30, 30);
      ctx.fillText("$", canvas.width - 40, 30);
      ctx.fillText("$", 30, canvas.height - 20);
      ctx.fillText("$", canvas.width - 40, canvas.height - 20);
      
      // Draw curved lines
      ctx.beginPath();
      ctx.moveTo(20, 50);
      ctx.quadraticCurveTo(50, 100, 20, 150);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(canvas.width - 20, 50);
      ctx.quadraticCurveTo(canvas.width - 50, 100, canvas.width - 20, 150);
      ctx.stroke();
      
      // Load and draw QR code
      const img = new Image();
      img.onload = () => {
        // Center the QR code
        const qrSize = 250;
        const x = (canvas.width - qrSize) / 2;
        const y = (canvas.height - qrSize - 60) / 2;
        
        ctx.drawImage(img, x, y, qrSize, qrSize);
        
        // Add website URL at bottom
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#004F9F";
        ctx.textAlign = "center";
        ctx.fillText("qpay.com.ng", canvas.width / 2, canvas.height - 40);
        
        // Create download link
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `payment-qr-${paymentType}-${code}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
        
        toast.success("QR Code downloaded successfully!");
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  // Create a URL-friendly JSON string for the QR code that includes the web app URL
  const qrData = JSON.stringify({
    type: paymentType,
    code: code,
    redirectUrl: "https://qpay.com.ng/"
  });

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

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Type
          </label>
          <Select
            value={paymentType}
            onValueChange={(value: "account" | "momopay") => {
              setPaymentType(value);
              setCode("");
              setShowQR(false);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="account">Account Number</SelectItem>
              <SelectItem value="momopay">MomoPay Code</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {paymentType === "account" ? "Account Number" : "MomoPay Code"}
          </label>
          <Input
            type="text"
            placeholder={
              paymentType === "account"
                ? "Enter account number (07xxxxxxxx)"
                : "Enter MomoPay code"
            }
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setShowQR(false);
            }}
          />
        </div>

        {!showQR && (
          <Button
            onClick={handleGenerate}
            className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
          >
            Generate QR Code
          </Button>
        )}

        {showQR && (
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <QRCodeSVG ref={qrRef} value={qrData} size={200} />
            </div>
            <Button
              onClick={handleDownload}
              className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
            >
              <Download className="w-4 h-4 mr-2" />
              Download QR Code
            </Button>
            <p className="text-sm text-gray-500 text-center">
              Scan this code with any QR scanner to make a payment
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;