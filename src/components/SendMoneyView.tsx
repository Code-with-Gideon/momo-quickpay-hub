
import { useState } from "react";
import { ArrowLeft, QrCode, User2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface SendMoneyViewProps {
  onBack: () => void;
}

interface RecentTransaction {
  phoneNumber: string;
  amount: string;
  date: string;
}

const recentTransactions: RecentTransaction[] = [
  { phoneNumber: "0789123456", amount: "RWF 5,000", date: "Today" },
  { phoneNumber: "0788987654", amount: "RWF 1,000", date: "Yesterday" },
];

const SendMoneyView = ({ onBack }: SendMoneyViewProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [step, setStep] = useState<"number" | "amount">("number");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const handleSelectRecent = (phoneNumber: string) => {
    setAccountNumber(phoneNumber);
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
        <div className="space-y-8 p-8 bg-white rounded-2xl shadow-sm">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#070058] rounded-full flex items-center justify-center shadow-md">
              <User2 className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <span className="text-[#070058] text-lg font-medium block">{accountNumber}</span>
              <span className="text-gray-500 text-sm">MTN Mobile Money</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[#070058] font-medium block">Amount</label>
              <Input
                type="number"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-14 bg-gray-50 rounded-xl text-lg placeholder:text-gray-400 border-0 focus-visible:ring-1"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("500")}
                className="h-14 bg-gray-50 hover:bg-gray-100 border-0 font-medium rounded-xl transition-colors"
              >
                RWF 500
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("1000")}
                className="h-14 bg-gray-50 hover:bg-gray-100 border-0 font-medium rounded-xl transition-colors"
              >
                RWF 1,000
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleQuickAmount("5000")}
                className="h-14 bg-gray-50 hover:bg-gray-100 border-0 font-medium rounded-xl transition-colors"
              >
                RWF 5,000
              </Button>
            </div>

            <div className="space-y-3">
              <label className="text-[#070058] font-medium block">
                Comment <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input
                placeholder="eg: Store Payment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="h-14 bg-gray-50 rounded-xl border-0 placeholder:text-gray-400 focus-visible:ring-1"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-[#070058] hover:bg-[#070058]/90 text-white font-medium rounded-xl flex items-center justify-center gap-3 shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            <Send className="w-5 h-5" />
            Send Money
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="p-8 bg-white rounded-2xl shadow-sm">
          <h2 className="text-[#070058] text-xl font-semibold mb-6">Enter Account Number or Code</h2>
          <div className="relative">
            <Input
              type="tel"
              placeholder="07xxxxxxxxx"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="h-14 bg-gray-50 rounded-xl pr-12 text-lg placeholder:text-gray-400 border-0 focus-visible:ring-1"
            />
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              onClick={() => {/* QR code scanner functionality */}}
            >
              <QrCode className="w-6 h-6 text-[#070058]" />
            </button>
          </div>
          <Button
            type="submit"
            className="w-full h-14 mt-6 bg-[#070058] hover:bg-[#070058]/90 text-white font-medium rounded-xl shadow-md transition-all duration-200 hover:scale-[1.02]"
          >
            Continue
          </Button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="flex border-b">
            <button className="flex-1 py-4 text-[#070058] font-semibold border-b-2 border-[#070058]">
              Recents
            </button>
            <button className="flex-1 py-4 text-gray-500 hover:text-gray-700 transition-colors">
              Favorite
            </button>
          </div>

          <div className="divide-y">
            {recentTransactions.map((transaction, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(transaction.phoneNumber)}
                className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-[#070058]">{transaction.phoneNumber}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <p className="font-medium text-[#070058]">{transaction.amount}</p>
              </button>
            ))}
          </div>
        </div>
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
            className="text-white flex items-center gap-2.5 mb-4 hover:opacity-90 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-white text-2xl font-bold">Send Money</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-6">
        <form onSubmit={handleSubmit}>
          {renderStep()}
        </form>
      </div>
    </div>
  );
};

export default SendMoneyView;
