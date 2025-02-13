
import { useState } from "react";
import { ArrowLeft, QrCode, User2, Send } from "lucide-react";
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
  const [comment, setComment] = useState("");

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === "number") {
      if (!accountNumber) {
        toast.error("Please enter an account number");
        return;
      }

      if (!/^07\d{8}$/.test(accountNumber)) {
        toast.error("Please enter a valid Rwanda phone number");
        return;
      }

      setStep("amount");
      return;
    }

    if (!amount) {
      toast.error("Please enter an amount");
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
        <div className="space-y-6 p-6 bg-white rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#070058] rounded-full flex items-center justify-center">
              <User2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-[#070058] font-medium">{accountNumber}</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[#070058] font-medium block mb-2">Amount</label>
              <Input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 bg-gray-50 rounded-xl"
              />
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("500")}
                className="flex-1 bg-gray-50 border-0 hover:bg-gray-100"
              >
                RWF 500
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("1000")}
                className="flex-1 bg-gray-50 border-0 hover:bg-gray-100"
              >
                RWF 1000
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("5000")}
                className="flex-1 bg-gray-50 border-0 hover:bg-gray-100"
              >
                RWF 5000
              </Button>
            </div>

            <div>
              <label className="text-[#070058] font-medium block mb-2">Comment <span className="text-gray-400">(Optional)</span></label>
              <Input
                placeholder="eg Store Payment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-12 bg-gray-50 rounded-xl"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-[#070058] hover:bg-[#070058]/90 text-white font-medium rounded-xl flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Send Money
          </Button>
        </div>
      );
    }

    return (
      <div className="p-6 bg-white rounded-2xl">
        <h2 className="text-[#070058] text-xl font-semibold mb-6">Enter Account Number or Code</h2>
        <div className="relative">
          <Input
            type="tel"
            placeholder="07xxxxxxxxx"
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            className="h-12 bg-gray-50 rounded-xl pr-12"
          />
          <button 
            className="absolute right-3 top-1/2 -translate-y-1/2"
            onClick={() => {/* QR code scanner functionality */}}
          >
            <QrCode className="w-6 h-6 text-[#070058]" />
          </button>
        </div>
        <Button
          type="submit"
          className="w-full h-12 mt-6 bg-[#070058] hover:bg-[#070058]/90 text-white font-medium rounded-xl"
        >
          Continue
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#070058] h-[150px] relative overflow-hidden">
        <img 
          src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png"
          alt="Wave Pattern"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
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
      <div className="px-4 -mt-6">
        <form onSubmit={handleSubmit}>
          {renderStep()}
        </form>

        {step === "number" && (
          <div className="mt-6 bg-white rounded-2xl overflow-hidden">
            <div className="flex border-b">
              <button className="flex-1 py-4 text-[#070058] font-semibold border-b-2 border-[#070058]">
                Recents
              </button>
              <button className="flex-1 py-4 text-gray-500">
                Favorite
              </button>
            </div>

            <div className="p-4">
              <div className="text-center text-gray-500 py-8">
                No recent transactions
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendMoneyView;
