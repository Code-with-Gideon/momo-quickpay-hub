
import { useState } from "react";
import { ArrowLeft, QrCode, User2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SendMoneyViewProps {
  onBack: () => void;
}

const SendMoneyView = ({ onBack }: SendMoneyViewProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [step, setStep] = useState<"number" | "amount">("number");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountNumber) {
      toast.error("Please enter an account number");
      return;
    }

    if (step === "number") {
      setStep("amount");
      return;
    }

    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    if (!/^07\d{8}$/.test(accountNumber)) {
      toast.error("Please enter a valid Rwanda phone number");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    const ussdCode = `tel:*182*1*1*${accountNumber}*${amount}%23`;
    window.location.href = ussdCode;
  };

  const renderStep = () => {
    if (step === "amount") {
      return (
        <div className="space-y-6">
          <h2 className="text-[#070058] text-xl font-semibold">Enter Amount</h2>
          <div>
            <Input
              type="number"
              placeholder="Amount in RWF"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-14 text-lg rounded-xl bg-gray-50"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <h2 className="text-[#070058] text-xl font-semibold">Enter Account Number or Code</h2>
        <div className="relative">
          <Input
            type="tel"
            placeholder="07xxxxxxxx"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-14 text-lg rounded-xl bg-gray-50 pr-12"
          />
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => {/* QR code scanner functionality */}}
          >
            <QrCode className="w-6 h-6 text-[#070058]" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#070058] h-[120px] relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/lovable-uploads/7c42d602-f88e-46a0-8074-6cd2fbb71fbf.png"
            alt="Wave Pattern"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 px-4 py-6">
          <button
            onClick={onBack}
            className="text-white flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-white text-2xl font-bold">Send Money</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}
          
          <Button
            type="submit"
            className="w-full h-14 text-lg font-semibold bg-[#070058] hover:bg-[#070058]/90 text-white rounded-xl"
          >
            Continue
          </Button>
        </form>

        {/* Recent and Favorite Sections */}
        <div className="mt-8">
          <div className="flex border-b">
            <button className="pb-2 text-[#070058] font-semibold border-b-2 border-[#070058] mr-8">
              Recents
            </button>
            <button className="pb-2 text-gray-500">
              Favorite
            </button>
          </div>

          <div className="py-4">
            {/* Empty state - no transactions */}
            <div className="text-center text-gray-500 py-8">
              No recent transactions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendMoneyView;
