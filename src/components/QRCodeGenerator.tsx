import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
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

  const handleGenerate = () => {
    if (!code) {
      toast.error("Please enter a code");
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

  // Create a URL-friendly JSON string for the QR code that includes the web app URL
  const qrData = JSON.stringify({
    type: paymentType,
    code: code,
    redirectUrl: "https://momo-quickpay-hub.lovable.app/"
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
              <QRCodeSVG value={qrData} size={200} />
            </div>
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