import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface MomoPayInputProps {
  onBack: () => void;
}

const MomoPayInput = ({ onBack }: MomoPayInputProps) => {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
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

    const ussdCode = `tel:*182*8*1*${code}*${amount}%23`;
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