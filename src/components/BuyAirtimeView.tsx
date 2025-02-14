import { useState } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
interface BuyAirtimeViewProps {
  onBack: () => void;
}
const BuyAirtimeView = ({
  onBack
}: BuyAirtimeViewProps) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const handleQuickAmount = (value: string) => {
    setAmount(value);
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
    const ussdCode = `tel:*182*2*1*${phoneNumber}*${amount}%23`;
    window.location.href = ussdCode;
  };
  return <div className="min-h-screen bg-gray-50">
      <div className="bg-[#070058] h-[120px] relative overflow-hidden">
        <img src="/lovable-uploads/d102728f-7e27-408b-a1b2-ff087d87e87f.png" alt="Banner Background" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="relative z-10 px-4 py-6">
          <button onClick={onBack} className="text-white flex items-center gap-2 mb-3 hover:opacity-90 transition-opacity text-sm">
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <h1 className="text-white font-bold text-2xl mx-[100px]">Buy Airtime</h1>
        </div>
      </div>

      <div className="px-4 -mt-6 py-[61px]">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm overflow-hidden p-6 space-y-6 py-[24px]">
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
        </form>
      </div>
    </div>;
};
export default BuyAirtimeView;