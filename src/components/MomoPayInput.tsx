
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { transactionService } from "@/utils/transactionService";
import { useAuth } from "@/contexts/AuthContext";

interface MomoPayInputProps {
  onBack: () => void;
}

const MomoPayInput = ({ onBack }: MomoPayInputProps) => {
  const [momoCode, setMomoCode] = useState("");
  const [amount, setAmount] = useState("");
  const { user } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!momoCode || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    // Validate MoMo Pay code format (typically 6 digits)
    if (!/^\d{6}$/.test(momoCode)) {
      toast.error("Please enter a valid MoMo Pay code (6 digits)");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Save transaction to history
    const newTransaction = {
      type: "send" as const,
      to: `MoMo Pay (${momoCode})`,
      amount: `RWF ${amount}`,
      date: "Today" as const,
      isMomoPay: true,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous'
    };
    
    transactionService.saveTransaction(newTransaction);

    // In real app, this would be integrated with mobile money API
    // For demo, simulate with USSD code for MoMo Pay
    const ussdCode = `tel:*182*8*1*${momoCode}*${amount}%23`;
    window.location.href = ussdCode;
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="momoCode" className="block text-sm font-medium text-gray-700 mb-1">
            MoMo Pay Code
          </label>
          <Input
            id="momoCode"
            type="text"
            placeholder="Enter 6-digit code"
            value={momoCode}
            onChange={(e) => setMomoCode(e.target.value)}
            className="w-full"
            maxLength={6}
          />
        </div>

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
          type="submit"
          className="w-full bg-mtn-yellow hover:bg-mtn-yellow/90 text-mtn-blue"
        >
          Continue to Payment
        </Button>
      </form>
    </div>
  );
};

export default MomoPayInput;
