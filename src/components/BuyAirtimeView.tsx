import { useState, useEffect } from "react";
import { ArrowLeft, Smartphone, Star } from "lucide-react";
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
  isFavorite?: boolean;
}
const BuyAirtimeView = ({
  onBack
}: BuyAirtimeViewProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [airtimeHistory, setAirtimeHistory] = useState<AirtimeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "favorite">("recent");
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
  const toggleFavorite = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = airtimeHistory.map(transaction => {
      if (transaction.phoneNumber === phoneNumber) {
        return {
          ...transaction,
          isFavorite: !transaction.isFavorite
        };
      }
      return transaction;
    });
    localStorage.setItem("airtime_history", JSON.stringify(updatedHistory));
    setAirtimeHistory(updatedHistory);
    toast.success(updatedHistory.find(t => t.phoneNumber === phoneNumber)?.isFavorite ? "Added to favorites" : "Removed from favorites");
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

    // Save to airtime history only
    const newTransaction = {
      phoneNumber,
      amount: `RWF ${amount}`,
      date: "Today"
    };
    const updatedHistory = [newTransaction, ...airtimeHistory].slice(0, 10);
    localStorage.setItem("airtime_history", JSON.stringify(updatedHistory));
    setAirtimeHistory(updatedHistory);

    // Save to general transactions (main dashboard)
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
  const filteredTransactions = activeTab === "favorite" ? airtimeHistory.filter(t => t.isFavorite) : airtimeHistory;
  return <div className="min-h-screen bg-gray-50">
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

      <div className="px-4 -mt-6 py-[50px]">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="text-[#070058] text-sm font-medium block mb-2">Enter Phone Number</label>
              <Input type="tel" placeholder="07xxxxxxxxx" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400" />
            </div>

            <div>
              <label className="text-[#070058] text-sm font-medium block mb-2">Amount</label>
              <Input type="number" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)} className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400 mb-3" />
              <div className="grid grid-cols-3 gap-3">
                {[["RWF 100", "100"], ["RWF 200", "200"], ["RWF 500", "500"], ["RWF 1000", "1000"], ["RWF 2000", "2000"], ["RWF 5000", "5000"]].map(([label, value]) => <Button key={value} type="button" variant="outline" onClick={() => handleQuickAmount(value)} className="h-10 bg-gray-50 hover:bg-gray-100 border-0 text-sm font-medium rounded-xl">
                    {label}
                  </Button>)}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 bg-[#070058] hover:bg-[#070058]/90 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
              <Smartphone className="w-4 h-4" />
              Buy Airtime
            </Button>
          </div>

          {airtimeHistory.length > 0 && <div className="border-t">
              <div className="flex border-b">
                <button onClick={() => setActiveTab("recent")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "recent" ? "text-[#070058] border-b-2 border-[#070058]" : "text-gray-500 hover:text-gray-700"}`}>
                  Recents
                </button>
                <button onClick={() => setActiveTab("favorite")} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === "favorite" ? "text-[#070058] border-b-2 border-[#070058]" : "text-gray-500 hover:text-gray-700"}`}>
                  Favorite
                </button>
              </div>

              <div className="divide-y">
                {filteredTransactions.length === 0 ? <div className="text-center text-gray-500 py-8 text-sm">
                    {activeTab === "favorite" ? "No favorite transactions" : "No recent transactions"}
                  </div> : filteredTransactions.map((transaction, idx) => <button key={idx} onClick={() => selectFromHistory(transaction)} className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors relative">
                      <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                        <Smartphone className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium text-[#070058]">{transaction.phoneNumber}</p>
                        <p className="text-xs text-gray-500">{transaction.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm font-medium text-[#070058]">{transaction.amount}</p>
                        <button onClick={e => toggleFavorite(transaction.phoneNumber, e)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <Star className={`w-5 h-5 ${transaction.isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-400"}`} />
                        </button>
                      </div>
                    </button>)}
              </div>
            </div>}
        </form>
      </div>
    </div>;
};
export default BuyAirtimeView;