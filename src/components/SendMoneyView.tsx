
import { useState, useEffect } from "react";
import { ArrowLeft, QrCode, User2, Send, Star, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import QRScanner from "./QRScanner";

interface SendMoneyViewProps {
  onBack: () => void;
}

interface StoredTransaction {
  phoneNumber: string;
  amount: string;
  date: string;
  type: "send" | "airtime" | "data";
  isFavorite?: boolean;
  isMomoPay?: boolean;
}

const SendMoneyView = ({ onBack }: SendMoneyViewProps) => {
  const [accountNumber, setAccountNumber] = useState("");
  const [step, setStep] = useState<"number" | "amount" | "scan">("number");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [recentTransactions, setRecentTransactions] = useState<StoredTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<"recent" | "favorite">("recent");
  const [isMomoPay, setIsMomoPay] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("send_money_history");
    if (stored) {
      setRecentTransactions(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    // Check if the input matches MomoPay format (5 digits)
    setIsMomoPay(/^\d{4,6}$/.test(accountNumber));
  }, [accountNumber]);

  const handleQuickAmount = (value: string) => {
    setAmount(value);
  };

  const handleSelectRecent = (transaction: StoredTransaction) => {
    setAccountNumber(transaction.phoneNumber);
    setIsMomoPay(transaction.isMomoPay || false);
  };

  const toggleFavorite = (phoneNumber: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTransactions = recentTransactions.map(transaction => {
      if (transaction.phoneNumber === phoneNumber) {
        return { ...transaction, isFavorite: !transaction.isFavorite };
      }
      return transaction;
    });
    localStorage.setItem("send_money_history", JSON.stringify(updatedTransactions));
    setRecentTransactions(updatedTransactions);
    toast.success(updatedTransactions.find(t => t.phoneNumber === phoneNumber)?.isFavorite 
      ? "Added to favorites" 
      : "Removed from favorites"
    );
  };

  const saveTransaction = (transaction: StoredTransaction) => {
    const stored = localStorage.getItem("send_money_history");
    const transactions = stored ? JSON.parse(stored) : [];
    const newTransactions = [transaction, ...transactions].slice(0, 10);
    localStorage.setItem("send_money_history", JSON.stringify(newTransactions));
    
    // Also save to general transactions for the main dashboard
    const generalStored = localStorage.getItem("transactions");
    const generalTransactions = generalStored ? JSON.parse(generalStored) : [];
    localStorage.setItem("transactions", JSON.stringify([transaction, ...generalTransactions].slice(0, 10)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "number") {
      if (!accountNumber) {
        toast.error("Please enter an account number or MomoPay code");
        return;
      }
      if (!isMomoPay && !/^07\d{8}$/.test(accountNumber)) {
        toast.error("Please enter a valid Rwanda phone number");
        return;
      }
      if (isMomoPay && !/^\d{4,6}$/.test(accountNumber)) {
        toast.error("Please enter a valid MomoPay code (5 digits)");
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

    saveTransaction({
      phoneNumber: accountNumber,
      amount: `RWF ${amount}`,
      date: "Today",
      type: "send",
      isMomoPay
    });

    // Different USSD format for MomoPay and regular transfers
    const ussdCode = isMomoPay
      ? `tel:*182*8*1*${accountNumber}*${amount}%23`
      : `tel:*182*1*1*${accountNumber}*${amount}%23`;
    window.location.href = ussdCode;
  };

  const handleQRScanComplete = (scannedData: string) => {
    try {
      const parsedData = JSON.parse(scannedData);
      if (parsedData.code) {
        setAccountNumber(parsedData.code);
        // Check if the scanned code is a MomoPay code
        setIsMomoPay(/^\d{5}$/.test(parsedData.code));
        setStep("amount");
      } else {
        toast.error("Invalid QR code format");
      }
    } catch (error) {
      toast.error("Invalid QR code");
    }
  };

  const renderStep = () => {
    if (step === "scan") {
      return <QRScanner onBack={() => setStep("number")} onScanSuccess={handleQRScanComplete} />;
    }

    if (step === "amount") {
      return <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
              {isMomoPay ? <Store className="w-5 h-5 text-white" /> : <User2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <span className="text-[#070058] text-base font-medium">{accountNumber}</span>
              {isMomoPay && <p className="text-sm text-gray-500">MomoPay Code</p>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[#070058] text-sm font-medium block mb-2">Amount</label>
              <Input type="number" placeholder="Enter Amount" value={amount} onChange={e => setAmount(e.target.value)} className="h-12 bg-gray-50 rounded-xl text-base placeholder:text-gray-400" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button type="button" variant="outline" onClick={() => handleQuickAmount("500")} className="h-10 bg-gray-50 hover:bg-gray-100 border-0 text-sm font-medium rounded-xl">
                RWF 500
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAmount("1000")} className="h-10 bg-gray-50 hover:bg-gray-100 border-0 text-sm font-medium rounded-xl">
                RWF 1,000
              </Button>
              <Button type="button" variant="outline" onClick={() => handleQuickAmount("5000")} className="h-10 bg-gray-50 hover:bg-gray-100 border-0 text-sm font-medium rounded-xl">
                RWF 5,000
              </Button>
            </div>

            <div>
              <label className="text-[#070058] text-sm font-medium block mb-2">
                Comment <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <Input placeholder="eg: Store Payment" value={comment} onChange={e => setComment(e.target.value)} className="h-12 bg-gray-50 rounded-xl placeholder:text-gray-400" />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 bg-[#070058] hover:bg-[#070058]/90 text-white text-sm font-medium rounded-xl flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Send Money
          </Button>
        </div>;
    }

    const filteredTransactions = activeTab === "favorite" 
      ? recentTransactions.filter(t => t.isFavorite)
      : recentTransactions;

    return (
      <div className="space-y-6">
        <div className="p-6">
          <h2 className="text-[#070058] text-lg font-semibold mb-4">Enter Account Number or MomoPay Code</h2>
          <div className="relative">
            <Input
              type="text"
              placeholder={isMomoPay ? "Enter 5-digit MomoPay code" : "07xxxxxxxxx"}
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              className="h-12 bg-gray-50 rounded-xl pr-12 text-base placeholder:text-gray-400"
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform"
              onClick={e => {
                e.preventDefault();
                setStep("scan");
              }}
            >
              <QrCode className="w-5 h-5 text-[#070058]" />
            </button>
          </div>
          <Button
            type="submit"
            className="w-full h-12 mt-4 bg-[#070058] hover:bg-[#070058]/90 text-white text-sm font-medium rounded-xl"
          >
            Continue
          </Button>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab("recent")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === "recent"
                  ? "text-[#070058] border-b-2 border-[#070058]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Recents
            </button>
            <button
              onClick={() => setActiveTab("favorite")}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                activeTab === "favorite"
                  ? "text-[#070058] border-b-2 border-[#070058]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Favorite
            </button>
          </div>

          <div className="divide-y">
            {filteredTransactions.length === 0 ? (
              <div className="text-center text-gray-500 py-8 text-sm">
                {activeTab === "favorite" ? "No favorite transactions" : "No recent transactions"}
              </div>
            ) : (
              filteredTransactions.map((transaction, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectRecent(transaction)}
                  className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors relative"
                >
                  <div className="w-12 h-12 rounded-full bg-[#070058] flex items-center justify-center">
                    {transaction.isMomoPay ? <Store className="w-5 h-5 text-white" /> : <User2 className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-[#070058]">{transaction.phoneNumber}</p>
                    {transaction.isMomoPay && <p className="text-xs text-gray-500">MomoPay Code</p>}
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-[#070058]">{transaction.amount}</p>
                    <button
                      onClick={(e) => toggleFavorite(transaction.phoneNumber, e)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          transaction.isFavorite
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return <div className="min-h-screen bg-gray-50">
      <div className="bg-[#070058] h-[120px] relative overflow-hidden">
        <img src="/lovable-uploads/0af956c5-c425-481b-a902-d2974b9a9e0b.png" alt="Banner Background" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="relative z-10 px-4 py-6">
          <button onClick={onBack} className="text-white flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-white font-bold text-2xl text-center">Send Money</h1>
        </div>
      </div>

      <div className="px-4 -mt-6 py-[50px]">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {renderStep()}
        </form>
      </div>
    </div>;
};

export default SendMoneyView;
