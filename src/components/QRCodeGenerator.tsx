import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";

interface QRCodeGeneratorProps {
  onBack: () => void;
}

const QRCodeGenerator = ({ onBack }: QRCodeGeneratorProps) => {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"account" | "momopay">("account");

  const generateQRData = () => {
    const data = {
      type,
      code,
      redirectUrl: "https://momo-quickpay-hub.lovable.app/",
    };
    return JSON.stringify(data);
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

      <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Type</h2>

      <div className="flex gap-3 mb-6">
        <Button
          type="button"
          onClick={() => setType("account")}
          variant={type === "account" ? "default" : "outline"}
          className={`flex-1 ${
            type === "account"
              ? "bg-mtn-yellow text-mtn-blue hover:bg-mtn-yellow/90"
              : ""
          }`}
        >
          Account Number
        </Button>
        <Button
          type="button"
          onClick={() => setType("momopay")}
          variant={type === "momopay" ? "default" : "outline"}
          className={`flex-1 ${
            type === "momopay"
              ? "bg-mtn-yellow text-mtn-blue hover:bg-mtn-yellow/90"
              : ""
          }`}
        >
          MomoPay Code
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            {type === "account" ? "Account Number" : "MomoPay Code"}
          </label>
          <Input
            id="code"
            type="text"
            placeholder={`Enter ${
              type === "account" ? "account number (07xxxxxxxx)" : "MomoPay code"
            }`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          type="button"
          onClick={() => {}}
          className="w-full bg-mtn-yellow text-mtn-blue hover:bg-mtn-yellow/90"
        >
          Generate QR Code
        </Button>

        {code && (
          <div className="flex justify-center mt-6">
            <QRCodeSVG value={generateQRData()} size={200} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodeGenerator;