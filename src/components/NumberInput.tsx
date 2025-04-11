
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
import { useAuth } from "@/contexts/AuthContext";

interface NumberInputProps {
  onBack: () => void;
}

const NumberInput = ({ onBack }: NumberInputProps) => {
  const [number, setNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [recentNumbers, setRecentNumbers] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Get recent airtime numbers
    const transactions = transactionService.getTransactionsByType("airtime");
    const uniqueNumbers = Array.from(new Set(
      transactions
        .filter(t => 'phoneNumber' in t)
        .map(t => (t as any).phoneNumber)
    ));
    setRecentNumbers(uniqueNumbers as string[]);
  }, []);

  const handleNumberSelect = (selected: string) => {
    setNumber(selected);
    setShowDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!number || !amount) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!/^07\d{8}$/.test(number)) {
      toast.error("Please enter a valid Rwanda phone number");
      return;
    }

    if (!/^\d+$/.test(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Save transaction to history
    const newTransaction = {
      type: "airtime" as const,
      phoneNumber: number,
      amount: `RWF ${amount}`,
      date: "Today" as const,
      timestamp: Date.now(),
      userId: user?.id || 'anonymous'
    };
    
    transactionService.saveTransaction(newTransaction);

    const ussdCode = `tel:*182*1*1*${number}*${amount}%23`;
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
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Input
              id="phone"
              type="tel"
              placeholder="07xxxxxxxx"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              className="w-full pr-10"
            />
            {recentNumbers.length > 0 && (
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
                  {recentNumbers.map((num, idx) => (
                    <DropdownMenuItem 
                      key={idx} 
                      onClick={() => handleNumberSelect(num)}
                      className="cursor-pointer"
                    >
                      {num}
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
          Continue to Payment
        </Button>
      </form>
    </div>
  );
};

export default NumberInput;
