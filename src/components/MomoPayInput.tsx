
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTransactions } from "@/hooks/useTransactions";
import { useAuth } from "@/contexts/AuthContext";

interface MomoPayInputProps {
  onBack: () => void;
  onTransactionComplete?: (transaction: any) => Promise<void>;
}

const MomoPayInput = ({ onBack, onTransactionComplete }: MomoPayInputProps) => {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const { user } = useAuth();
  const { addTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^\d+$/.test(code)) {
      toast.error("Please enter a valid MomoPay code");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Add minimum amount validation (100 RWF)
    if (parseInt(amount) < 100) {
      toast.error("Minimum transaction amount is 100 RWF");
      return;
    }

    try {
      // Create transaction object
      const newTransaction = {
        type: "send" as const,
        to: code,
        amount: `RWF ${amount}`,
        date: "Today" as const,
        isMomoPay: true,
        timestamp: Date.now(),
        userId: user?.id || 'demo-user'
      };
      
      // If onTransactionComplete is passed, use it
      if (onTransactionComplete) {
        await onTransactionComplete(newTransaction);
      } else {
        // Otherwise save directly
        await addTransaction(newTransaction);
        
        toast.success("Transaction completed successfully!");
        
        // Open USSD code
        const ussdCode = `tel:*182*8*1*${code}*${amount}%23`;
        window.location.href = ussdCode;
      }
    } catch (error) {
      console.error("Transaction failed:", error);
      toast.error("Transaction failed. Please try again.");
    }
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
          <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
            MomoPay Code
          </label>
          <Input
            id="code"
            type="text"
            placeholder="Enter MomoPay code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full"
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
          Pay with MomoPay
        </Button>
      </form>
    </div>
  );
};

export default MomoPayInput;
