
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { transactionService } from "@/utils/transactionService";

interface MomoPayInputProps {
  onBack: () => void;
}

const MomoPayInput = ({ onBack }: MomoPayInputProps) => {
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [recentCodes, setRecentCodes] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Get recent momopay codes from transactions
    const sendTransactions = transactionService.getTransactionsByType("send");
    const uniqueCodes = Array.from(new Set(
      sendTransactions
        .filter(t => 'to' in t && (t as any).isMomoPay)
        .map(t => (t as any).to)
    ));
    setRecentCodes(uniqueCodes as string[]);
  }, []);

  const handleCodeSelect = (selected: string) => {
    setCode(selected);
    setShowDropdown(false);
  };

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

    // Save transaction to history
    const newTransaction = {
      type: "send" as const,
      to: code,
      amount: `RWF ${amount}`,
      date: "Today" as const,
      isMomoPay: true,
      timestamp: Date.now(),
    };
    
    transactionService.saveTransaction(newTransaction);

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
          <div className="relative">
            <Input
              id="code"
              type="text"
              placeholder="Enter MomoPay code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full pr-10"
            />
            {recentCodes.length > 0 && (
              <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {recentCodes.map((code, idx) => (
                    <DropdownMenuItem 
                      key={idx} 
                      onClick={() => handleCodeSelect(code)}
                      className="cursor-pointer"
                    >
                      {code}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
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
