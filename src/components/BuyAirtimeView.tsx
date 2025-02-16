
import { useState, useEffect } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface BuyAirtimeViewProps {
  onBack: () => void;
}

interface AirtimeTransaction {
  phoneNumber: string;
  amount: string;
  date: string;
}

const BuyAirtimeView = ({
  onBack
}: BuyAirtimeViewProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [airtimeHistory, setAirtimeHistory] = useState<AirtimeTransaction[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("airtime_history");
    if (stored) {
      setAirtimeHistory(JSON.parse(stored));
    }
  }, []);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const selectFromHistory = (transaction: AirtimeTransaction) => {
    setPhoneNumber(transaction.phoneNumber);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
      toast.error("Please enter a phone number");
      return;
    }
    if (!/^07\d{8}$/.test(phoneNumber)) {
      toast.error("Please enter a valid Rwanda phone number");
      return;
    }
    if (!amount) {
      toast.error("Please enter an amount");
      return;
    }

    // Save to airtime history
    const newTransaction = {
      phoneNumber,
      amount: `RWF ${amount}`,
      date: "Today"
    };
    const updatedHistory = [newTransaction, ...airtimeHistory].slice(0, 10);
    localStorage.setItem("airtime_history", JSON.stringify(updatedHistory));

    // Save to general transactions
    const transaction = {
      phoneNumber,
      amount: `RWF ${amount}`,
      date: "Today",
      type: "airtime" as const
    };
    const stored = localStorage.getItem("transactions");
    const transactions = stored ? JSON.parse(stored) : [];
    localStorage.setItem("transactions", JSON.stringify([transaction, ...transactions].slice(0, 10)));

    const ussdCode = `tel:*182*2*1*1*2*${amount}*${phoneNumber}%23`;
    window.location.href = ussdCode;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#070058] h-[120px] relative overflow-hidden">
        <img src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" alt="Banner Background" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="relative z-10 px-4 py-6">
          <button onClick={onBack} className="text-white flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-white font-bold text-2xl text-center">Buy Airtime</h1>
        </div>
      </div>

      <div className="px-4 -mt-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 space-y-6">
          <div>
            <label className="text-[#070058] text-sm font-medium block mb-2">Enter Phone Number</label>
            <Input
              type="tel"
              placeholder="07xxxxxxxxx"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="text-[#070058] text-sm font-medium block mb-2">Amount</label>
            <Input
              type="number"
              placeholder="Enter Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400 mb-3"
            />
            <div className="grid grid-cols-3 gap-3">
              {[["RWF 100", "100"], ["RWF 200", "200"], ["RWF 500", "500"], ["RWF 1000", "1000"], ["RWF 2000", "2000"], ["RWF 5000", "5000"]].map(([label, value]) => (
                <Button
                  key={value}
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickAmount(value)}
                  className="h-10 bg-gray-50 hover:bg-gray-100 border-0 text-sm font-medium rounded-xl"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-[#070058] hover:bg-[#070058]/90 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
            <Smartphone className="w-4 h-4" />
            Buy Airtime
          </Button>
        </form>

        {airtimeHistory.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-sm overflow-hidden">
            <h2 className="text-[#070058] font-semibold p-4 border-b">Recent Airtime History</h2>
            <div className="divide-y">
              {airtimeHistory.map((transaction, idx) => (
                <button
                  key={idx}
                  onClick={() => selectFromHistory(transaction)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#070058] flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-[#070058]">{transaction.phoneNumber}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <span className="font-medium text-[#070058]">{transaction.amount}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuyAirtimeView;
